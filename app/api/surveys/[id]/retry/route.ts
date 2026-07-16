import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueSurvey } from "@/lib/pipeline";
import { matches, problems, surveyBatches } from "@/lib/schema";
import { now } from "@/lib/utils";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const existing = db.select().from(surveyBatches).where(eq(surveyBatches.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Survey not found." }, { status: 404 });
  const problemRows = db.select({ id: problems.id }).from(problems).where(eq(problems.batchId, id)).all();
  if (problemRows.length) {
    db.delete(matches).where(inArray(matches.problemId, problemRows.map((problem) => problem.id))).run();
    db.delete(problems).where(eq(problems.batchId, id)).run();
  }
  db.update(surveyBatches).set({ status: "processing", stage: "checking", problemCount: 0, attentionCount: 0, errorLog: "[]", updatedAt: now() })
    .where(eq(surveyBatches.id, id)).run();
  enqueueSurvey(id);
  return NextResponse.json({ status: "processing" });
}
