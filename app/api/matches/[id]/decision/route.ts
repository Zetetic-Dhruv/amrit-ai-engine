import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import { recalculateProblem } from "@/lib/pipeline";
import { matches } from "@/lib/schema";
import { now } from "@/lib/utils";

const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]).nullable(),
  rejectionReason: z.enum(["Not relevant", "Wrong track", "Already engaged", "Duplicate"]).nullable().optional(),
}).refine((value) => value.decision !== "rejected" || Boolean(value.rejectionReason), "Choose a rejection reason.");

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const current = db.select().from(matches).where(eq(matches.id, id)).get();
  if (!current) return NextResponse.json({ error: "Recommendation not found." }, { status: 404 });
  const parsed = decisionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const previous = { decision: current.decision, rejectionReason: current.rejectionReason };
  db.update(matches).set({
    decision: parsed.data.decision,
    rejectionReason: parsed.data.decision === "rejected" ? parsed.data.rejectionReason || null : null,
    decisionAt: parsed.data.decision ? now() : null,
  }).where(eq(matches.id, id)).run();
  recalculateProblem(current.problemId);
  recordEvent(parsed.data.decision ? `match_${parsed.data.decision}` : "match_decision_undone", "success", {
    matchId: id, problemId: current.problemId, reason: parsed.data.rejectionReason || null,
  }, "Reviewer");
  return NextResponse.json({ ok: true, previous });
}
