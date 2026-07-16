import { NextResponse } from "next/server";
import { chatModel, embedModel, ollamaStatus } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await ollamaStatus();
  return NextResponse.json({ ...result, chatModel, embedModel });
}
