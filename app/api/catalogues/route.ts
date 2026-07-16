import fs from "node:fs";
import { NextResponse } from "next/server";
import { parseCatalogue } from "@/lib/parsers";
import { db, uploadsDir } from "@/lib/db";
import { catalogues } from "@/lib/schema";
import { enqueueCatalogue } from "@/lib/pipeline";
import { hashBuffer, id, now } from "@/lib/utils";
import { recordEvent } from "@/lib/events";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a catalogue file." }, { status: 400 });
  if (!/\.(xlsx|csv)$/i.test(file.name)) return NextResponse.json({ error: "Use an XLSX or CSV file." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "The file must be smaller than 20 MB." }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = parseCatalogue(buffer);
  if (!parsed.rows.length) return NextResponse.json({ error: parsed.errors[0] || "No valid providers were found.", errors: parsed.errors }, { status: 400 });
  const catalogueId = id();
  db.insert(catalogues).values({
    id: catalogueId, filename: file.name, fileHash: hashBuffer(buffer), status: "processing",
    isActive: false, providerCount: 0, errorLog: JSON.stringify(parsed.errors), createdAt: now(),
  }).run();
  fs.writeFileSync(`${uploadsDir}/catalogue-${catalogueId}`, buffer);
  recordEvent("catalogue_uploaded", "success", { catalogueId, filename: file.name });
  enqueueCatalogue(catalogueId);
  return NextResponse.json({ catalogueId, status: "processing" });
}
