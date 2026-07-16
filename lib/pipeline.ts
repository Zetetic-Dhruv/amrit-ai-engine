import fs from "node:fs";
import PQueue from "p-queue";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { loadRules, loadTracks } from "./config";
import { db, uploadsDir } from "./db";
import { recordEvent } from "./events";
import { chatModel, embed, embedModel, generateStructured, ollamaStatus } from "./ollama";
import { applyRules, parseCatalogue, parseSurvey } from "./parsers";
import { catalogues, matches, problems, providers, surveyBatches, villageSurveys } from "./schema";
import { cosineSimilarity, id, now, safeJson } from "./utils";
import { matchRerankingPrompt, matchRerankingPromptVersion } from "@/prompts/match-reranking";
import { problemConsolidationPrompt, problemConsolidationPromptVersion } from "@/prompts/problem-consolidation";

const queue = new PQueue({ concurrency: 1 });

const consolidatedSchema = z.object({
  problems: z.array(z.object({
    statement: z.string().min(8),
    track: z.string().min(1),
    confidence: z.number().min(0).max(1),
    rationale: z.string().min(4),
    sourceQuestionIds: z.array(z.string()).min(1),
    urgency: z.number().int().min(1).max(5),
    importance: z.number().int().min(1).max(5),
  })),
});

const rerankedSchema = z.object({
  matches: z.array(z.object({
    providerId: z.string().min(1),
    explanation: z.string().min(12),
  })).max(5),
});

function localAiMessage() {
  return "The local AI service is not running. Start Ollama, make sure the configured models are available, then retry.";
}

export function enqueueCatalogue(catalogueId: string) {
  void queue.add(() => processCatalogue(catalogueId));
}

export function enqueueSurvey(batchId: string) {
  void queue.add(() => processSurvey(batchId));
}

export async function processCatalogue(catalogueId: string) {
  const filePath = `${uploadsDir}/catalogue-${catalogueId}`;
  try {
    const status = await ollamaStatus();
    if (!status.available) throw new Error(localAiMessage());
    const parsed = parseCatalogue(fs.readFileSync(filePath));
    if (!parsed.rows.length) throw new Error(parsed.errors.join(" ") || "No providers could be read.");

    for (const provider of parsed.rows) {
      const searchable = [provider.name, provider.description, provider.trackTags.join(", ")].filter(Boolean).join(". ");
      const vector = await embed(searchable);
      db.insert(providers).values({
        id: id(), catalogueId, name: provider.name, description: provider.description,
        trackTags: JSON.stringify(provider.trackTags), contactName: provider.contactName,
        contactEmail: provider.contactEmail, contactPhone: provider.contactPhone,
        embedding: JSON.stringify(vector),
      }).run();
    }
    db.update(catalogues).set({ isActive: false }).run();
    db.update(catalogues).set({
      status: "ready", isActive: true, providerCount: parsed.rows.length,
      errorLog: JSON.stringify(parsed.errors),
    }).where(eq(catalogues.id, catalogueId)).run();
    recordEvent("catalogue_ready", "success", { catalogueId, providers: parsed.rows.length, model: embedModel });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Catalogue processing failed.";
    db.update(catalogues).set({ status: "failed", errorLog: JSON.stringify([message]) })
      .where(eq(catalogues.id, catalogueId)).run();
    recordEvent("catalogue_failed", "failure", { catalogueId, message });
  }
}

export async function processSurvey(batchId: string) {
  const batch = db.select().from(surveyBatches).where(eq(surveyBatches.id, batchId)).get();
  if (!batch) return;
  try {
    const status = await ollamaStatus();
    if (!status.available) throw new Error(localAiMessage());
    const activeCatalogue = db.select().from(catalogues)
      .where(and(eq(catalogues.id, batch.catalogueId || ""), eq(catalogues.status, "ready"))).get();
    if (!activeCatalogue) throw new Error("The provider catalogue is not ready. Load it in Settings, then retry.");

    db.update(surveyBatches).set({ status: "processing", stage: "finding_problems", updatedAt: now() })
      .where(eq(surveyBatches.id, batchId)).run();
    const villages = db.select().from(villageSurveys).where(eq(villageSurveys.batchId, batchId)).all();
    const rules = loadRules();
    const tracks = loadTracks();
    let attentionCount = 0;

    for (const village of villages) {
      const candidates = applyRules(safeJson(village.answers, {}), rules);
      if (!candidates.length) continue;
      db.update(surveyBatches).set({ stage: "classifying", updatedAt: now() })
        .where(eq(surveyBatches.id, batchId)).run();
      try {
        const consolidated = await generateStructured(
          problemConsolidationPrompt(village.name, candidates, tracks),
          consolidatedSchema.refine((result) => result.problems.every((problem) => tracks.includes(problem.track)), "Unknown track"),
        );
        for (const problem of consolidated.problems) {
          db.insert(problems).values({
            id: id(), batchId, villageId: village.id, statement: problem.statement,
            track: problem.track, confidence: problem.confidence, rationale: problem.rationale,
            sourceQuestionIds: JSON.stringify(problem.sourceQuestionIds), urgency: problem.urgency,
            importance: problem.importance, status: "pending", classificationStatus: "classified",
            promptVersion: problemConsolidationPromptVersion, modelVersion: chatModel, createdAt: now(),
          }).run();
        }
      } catch (error) {
        attentionCount += candidates.length;
        for (const candidate of candidates) {
          db.insert(problems).values({
            id: id(), batchId, villageId: village.id, statement: candidate.statement,
            track: null, confidence: null, rationale: "The problem was identified by survey rules, but its track could not be classified.",
            sourceQuestionIds: JSON.stringify(candidate.sourceQuestionIds), urgency: candidate.urgency,
            importance: candidate.importance, status: "pending", classificationStatus: "unavailable",
            promptVersion: problemConsolidationPromptVersion, modelVersion: chatModel, createdAt: now(),
          }).run();
        }
        recordEvent("classification_flagged", "flagged", { batchId, village: village.name, message: String(error) });
      }
    }

    db.update(surveyBatches).set({ stage: "finding_providers", updatedAt: now() })
      .where(eq(surveyBatches.id, batchId)).run();
    const allProviders = db.select().from(providers).where(eq(providers.catalogueId, activeCatalogue.id)).all();
    const allProblems = db.select().from(problems).where(eq(problems.batchId, batchId)).all();

    for (const problem of allProblems) {
      const problemVector = await embed(problem.statement);
      const nearest = allProviders
        .map((provider) => ({ provider, score: cosineSimilarity(problemVector, safeJson(provider.embedding, [])) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      if (!nearest.length) {
        db.update(problems).set({ status: "complete" }).where(eq(problems.id, problem.id)).run();
        continue;
      }
      let ranked: { providerId: string; explanation: string }[];
      try {
        const result = await generateStructured(
          matchRerankingPrompt(problem.statement, nearest.map(({ provider, score }) => ({
            providerId: provider.id, name: provider.name, description: provider.description,
            trackTags: safeJson(provider.trackTags, []), similarity: score,
          }))),
          rerankedSchema.refine((value) => value.matches.every((match) => nearest.some(({ provider }) => provider.id === match.providerId)), "Unknown provider"),
        );
        ranked = result.matches;
      } catch (error) {
        attentionCount += 1;
        ranked = nearest.slice(0, 5).map(({ provider }) => ({
          providerId: provider.id,
          explanation: "This provider's offering is closely related to the stated village need. A reviewer should confirm the practical fit.",
        }));
        recordEvent("matching_flagged", "flagged", { batchId, problemId: problem.id, message: String(error) });
      }
      ranked.forEach((rankedMatch, index) => {
        const source = nearest.find(({ provider }) => provider.id === rankedMatch.providerId);
        if (!source) return;
        db.insert(matches).values({
          id: id(), problemId: problem.id, providerId: source.provider.id, rank: index + 1,
          similarity: source.score, explanation: rankedMatch.explanation,
          promptVersion: matchRerankingPromptVersion, modelVersion: chatModel, createdAt: now(),
        }).run();
      });
    }

    const problemCount = allProblems.length;
    db.update(surveyBatches).set({
      status: "complete", stage: "ready", problemCount, attentionCount,
      updatedAt: now(), errorLog: "[]",
    }).where(eq(surveyBatches.id, batchId)).run();
    recordEvent("survey_ready", "success", { batchId, villages: villages.length, problems: problemCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Survey processing failed.";
    db.update(surveyBatches).set({ status: "failed", stage: "failed", errorLog: JSON.stringify([message]), updatedAt: now() })
      .where(eq(surveyBatches.id, batchId)).run();
    recordEvent("survey_failed", "failure", { batchId, message });
  }
}

export function recalculateProblem(problemId: string) {
  const problemMatches = db.select().from(matches).where(eq(matches.problemId, problemId)).all();
  const decided = problemMatches.filter((match) => match.decision).length;
  const status = !problemMatches.length || decided === problemMatches.length
    ? "complete"
    : decided > 0 ? "in_progress" : "pending";
  db.update(problems).set({ status }).where(eq(problems.id, problemId)).run();
}

export function batchReviewProgress(batchId: string) {
  const batchProblems = db.select({ id: problems.id }).from(problems).where(eq(problems.batchId, batchId)).all();
  if (!batchProblems.length) return { decided: 0, total: 0 };
  const result = db.select().from(matches).where(inArray(matches.problemId, batchProblems.map((problem) => problem.id))).all();
  return { decided: result.filter((match) => match.decision).length, total: result.length };
}

export function batchDetails(batchId: string) {
  const batch = db.select().from(surveyBatches).where(eq(surveyBatches.id, batchId)).get();
  if (!batch) return null;
  const villageRows = db.select().from(villageSurveys).where(eq(villageSurveys.batchId, batchId)).all();
  const problemRows = db.select().from(problems).where(eq(problems.batchId, batchId)).orderBy(asc(problems.createdAt)).all();
  const providerRows = db.select().from(providers).all();
  const matchRows = problemRows.length
    ? db.select().from(matches).where(inArray(matches.problemId, problemRows.map((problem) => problem.id))).orderBy(asc(matches.rank)).all()
    : [];
  return {
    batch,
    progress: batchReviewProgress(batchId),
    problems: problemRows.map((problem) => ({
      ...problem,
      sourceQuestionIds: safeJson<string[]>(problem.sourceQuestionIds, []),
      village: villageRows.find((village) => village.id === problem.villageId)?.name || "Village",
      matches: matchRows.filter((match) => match.problemId === problem.id).map((match) => ({
        ...match,
        provider: (() => {
          const provider = providerRows.find((row) => row.id === match.providerId)!;
          return { ...provider, trackTags: safeJson<string[]>(provider.trackTags, []) };
        })(),
      })),
    })),
  };
}

export function recentBatches() {
  return db.select().from(surveyBatches).orderBy(desc(surveyBatches.createdAt)).all()
    .map((batch) => ({ ...batch, progress: batchReviewProgress(batch.id) }));
}
