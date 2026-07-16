import fs from "node:fs";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, uploadsDir } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import { parseSurvey } from "@/lib/parsers";
import { enqueueSurvey } from "@/lib/pipeline";
import { catalogues, surveyBatches, villageSurveys } from "@/lib/schema";
import { hashBuffer, id, now } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const activeCatalogue = db.select().from(catalogues).where(eq(catalogues.isActive, true)).orderBy(desc(catalogues.createdAt)).get();
  if (!activeCatalogue || activeCatalogue.status !== "ready") {
    return NextResponse.json({ error: "Load a provider catalogue in Settings before uploading a survey." }, { status: 409 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a village survey." }, { status: 400 });
  if (!/\.xlsx$/i.test(file.name)) return NextResponse.json({ error: "Village surveys must be XLSX workbooks." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "The file must be smaller than 20 MB." }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = hashBuffer(buffer);
  const duplicate = db.select().from(surveyBatches).where(eq(surveyBatches.fileHash, hash)).get();
  if (duplicate) return NextResponse.json({ error: "This exact file has already been uploaded.", duplicateId: duplicate.id }, { status: 409 });
  const parsed = parseSurvey(buffer);
  if (!parsed.rows.length || parsed.errors.length) {
    return NextResponse.json({ error: parsed.errors[0] || "No valid village rows were found.", errors: parsed.errors }, { status: 400 });
  }
  const batchId = id();
  const timestamp = now();
  db.insert(surveyBatches).values({
    id: batchId, filename: file.name, fileHash: hash, status: "processing", stage: "checking",
    villageCount: parsed.rows.length, problemCount: 0, attentionCount: 0, errorLog: "[]",
    catalogueId: activeCatalogue.id, createdAt: timestamp, updatedAt: timestamp,
  }).run();
  for (const village of parsed.rows) {
    db.insert(villageSurveys).values({ id: id(), batchId, name: village.name, answers: JSON.stringify(village.answers) }).run();
  }
  fs.writeFileSync(`${uploadsDir}/survey-${batchId}`, buffer);
  recordEvent("survey_uploaded", "success", { batchId, filename: file.name, villages: parsed.rows.length });
  enqueueSurvey(batchId);
  return NextResponse.json({ batchId, status: "processing" });
}
