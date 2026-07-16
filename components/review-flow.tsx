"use client";

import { ArrowLeft, ArrowRight, Check, ChevronRight, Mail, MapPin, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Provider = { id: string; name: string; description: string; trackTags: string[]; contactName: string | null; contactEmail: string | null; contactPhone: string | null };
type Match = { id: string; rank: number; explanation: string; decision: string | null; rejectionReason: string | null; provider: Provider };
type Problem = { id: string; statement: string; track: string | null; village: string; matches: Match[] };
type ReviewData = { batch: { id: string; filename: string }; problems: Problem[]; progress: { decided: number; total: number } };
type ToastState = { matchId: string; previous: { decision: string | null; rejectionReason: string | null }; index: number };

const reasons = ["Not relevant", "Wrong track", "Already engaged", "Duplicate"];

export function ReviewFlow({ batchId }: { batchId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [index, setIndex] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const flat = useMemo(() => data?.problems.flatMap((problem, problemIndex) => problem.matches.map((match, providerIndex) => ({ problem, match, problemIndex, providerIndex }))) || [], [data]);

  useEffect(() => {
    fetch(`/api/review/${batchId}`, { cache: "no-store" }).then((response) => response.json()).then((result: ReviewData) => {
      setData(result);
      const firstUndecided = result.problems.flatMap((problem) => problem.matches).findIndex((match) => !match.decision);
      setIndex(firstUndecided >= 0 ? firstUndecided : 0);
    });
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [batchId]);

  async function decide(decision: "approved" | "rejected", rejectionReason: string | null = null) {
    const current = flat[index]; if (!current || busy) return;
    setBusy(true);
    const previous = { decision: current.match.decision, rejectionReason: current.match.rejectionReason };
    const response = await fetch(`/api/matches/${current.match.id}/decision`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision, rejectionReason }),
    });
    setBusy(false); setRejecting(false);
    if (!response.ok) return;
    setData((old) => old ? ({ ...old, problems: old.problems.map((problem) => ({ ...problem, matches: problem.matches.map((match) => match.id === current.match.id ? { ...match, decision, rejectionReason } : match) })) }) : old);
    setToast({ matchId: current.match.id, previous, index });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
    const remaining = flat.filter((item, itemIndex) => itemIndex !== index && !item.match.decision);
    if (!remaining.length) {
      setTimeout(() => router.push(`/complete/${batchId}`), 350);
    } else {
      const nextUndecided = flat.findIndex((item, itemIndex) => itemIndex > index && !item.match.decision);
      setIndex(nextUndecided >= 0 ? nextUndecided : flat.findIndex((item) => !item.match.decision));
    }
  }

  async function undo() {
    if (!toast) return;
    await fetch(`/api/matches/${toast.matchId}/decision`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: toast.previous.decision, rejectionReason: toast.previous.rejectionReason }),
    });
    const saved = toast;
    setData((old) => old ? ({ ...old, problems: old.problems.map((problem) => ({ ...problem, matches: problem.matches.map((match) => match.id === saved.matchId ? { ...match, ...saved.previous } : match) })) }) : old);
    setIndex(saved.index); setToast(null);
  }

  if (!data) return <main className="narrow"><div className="card empty">Opening the recommendations…</div></main>;
  if (!flat.length) return <main className="narrow"><div className="card card-pad"><h2>No matching providers</h2><p className="lede">The current catalogue does not contain a clear match for these problems.</p><Link href={`/complete/${batchId}`} className="button button-primary" style={{ marginTop: 22 }}>View summary</Link></div></main>;
  const current = flat[index] || flat[0];
  const decidedCount = flat.filter((item) => item.match.decision).length;
  const percent = flat.length ? Math.round((decidedCount / flat.length) * 100) : 0;
  const sameProblem = current.problem.matches;

  return <main className="narrow">
    <div className="review-head">
      <Link className="text-link" href={`/surveys/${batchId}`}><ArrowLeft size={14} /> Back to problems</Link>
      <div className="review-progress" style={{ marginTop: 24 }}><span>Provider {current.providerIndex + 1} of {sameProblem.length}</span><span>Problem {current.problemIndex + 1} of {data.problems.length}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
    </div>
    <div className="context-card"><div className="eyebrow" style={{ marginBottom: 5 }}>{current.problem.village} · {current.problem.track || "Track unavailable"}</div><p>{current.problem.statement}</p></div>
    <article className="card match-card">
      <span className="rank">Recommendation {current.match.rank}</span>
      <h2>{current.match.provider.name}</h2>
      <p className="provider-description">{current.match.provider.description}</p>
      {current.match.provider.trackTags.length > 0 && <div className="actions">{current.match.provider.trackTags.map((tag) => <span className="pill pill-neutral" key={tag}>{tag}</span>)}</div>}
      <div className="explanation"><strong>Why this may fit</strong><br />{current.match.explanation}</div>
      <div className="contact-grid">
        <div className="contact-item"><div className="contact-label"><MapPin size={11} /> Contact</div><div className="contact-value">{current.match.provider.contactName || "Not provided"}</div></div>
        <div className="contact-item"><div className="contact-label"><Mail size={11} /> Email</div><div className="contact-value">{current.match.provider.contactEmail || "Not provided"}</div></div>
        <div className="contact-item"><div className="contact-label"><Phone size={11} /> Phone</div><div className="contact-value">{current.match.provider.contactPhone || "Not provided"}</div></div>
      </div>
      {current.match.decision && <div className={`alert ${current.match.decision === "approved" ? "alert-success" : "alert-error"}`}>Current decision: {current.match.decision === "approved" ? "Approved" : `Rejected · ${current.match.rejectionReason}`}</div>}
      <div className="decision-bar">
        <button className="button button-secondary" disabled={busy} onClick={() => setRejecting((value) => !value)}><X size={17} /> Reject</button>
        <button className="button button-primary" disabled={busy} onClick={() => decide("approved")}><Check size={17} /> Approve</button>
      </div>
      {rejecting && <div className="reason-grid">{reasons.map((reason) => <button className="reason" key={reason} onClick={() => decide("rejected", reason)}>{reason}<ChevronRight size={14} style={{ float: "right" }} /></button>)}</div>}
      {current.match.decision && index < flat.length - 1 && <button className="text-link" style={{ border: 0, background: "none", margin: "18px auto 0", cursor: "pointer" }} onClick={() => setIndex((value) => Math.min(value + 1, flat.length - 1))}>Next recommendation <ArrowRight size={14} /></button>}
    </article>
    {toast && <div className="toast" role="status">Decision saved <button onClick={undo}>Undo</button></div>}
  </main>;
}
