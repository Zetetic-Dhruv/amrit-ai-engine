import { NextResponse } from "next/server";
import { batchDetails } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = batchDetails(id);
  if (!result) return NextResponse.json({ error: "Survey not found." }, { status: 404 });
  return NextResponse.json(result);
}
