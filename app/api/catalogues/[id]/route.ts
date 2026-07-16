import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { catalogues } from "@/lib/schema";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const catalogue = db.select().from(catalogues).where(eq(catalogues.id, id)).get();
  if (!catalogue) return NextResponse.json({ error: "Catalogue not found." }, { status: 404 });
  return NextResponse.json({ ...catalogue, errorLog: safeJson<string[]>(catalogue.errorLog, []) });
}
