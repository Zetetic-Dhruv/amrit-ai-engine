"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Check, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "./status-pill";

type Problem = {
  id: string; statement: string; track: string | null; confidence: number | null; rationale: string | null;
  sourceQuestionIds: string[]; classificationStatus: string; status: string; village: string; matches: unknown[];
};
type Result = {
  batch: { id: string; filename: string; status: string; stage: string; villageCount: number; problemCount: number; attentionCount: number; errorLog: string };
  progress: { decided: number; total: number };
  problems: Problem[];
};

const stages = [
  ["checking", "Checking the file"], ["finding_problems", "Finding village problems"],
  ["classifying", "Classifying problems"], ["finding_providers", "Finding suitable providers"], ["ready", "Ready for review"],
];

export function SurveyResults({ batchId }: { batchId: string }) {
  const [data, setData] = useState<Result | null>(null);
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();
  async function refresh() {
    const response = await fetch(`/api/surveys/${batchId}`, { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }
  useEffect(() => {
    let active = true;
    fetch(`/api/surveys/${batchId}`, { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (active) setData(result);
    });
    return () => { active = false; };
  }, [batchId]);
  const processingStatus = data?.batch.status;
  useEffect(() => {
    if (processingStatus !== "processing") return;
    const timer = setInterval(() => {
      fetch(`/api/surveys/${batchId}`, { cache: "no-store" }).then((response) => response.json()).then(setData);
    }, 1200);
    return () => clearInterval(timer);
  }, [batchId, processingStatus]);
  const currentStage = Math.max(0, stages.findIndex(([key]) => key === data?.batch.stage));
  const reviewPercent = data?.progress.total ? Math.round((data.progress.decided / data.progress.total) * 100) : 0;
  const complete = Boolean(data?.progress.total && data.progress.decided === data.progress.total);
  const actionLabel = complete ? "Review decisions" : data?.progress.decided ? "Continue review" : "Start review";

  if (!data) return <div className="card status-panel"><LoaderCircle className="animate-spin" /><p className="muted">Opening the survey…</p></div>;
  if (data.batch.status === "processing") return <div className="card status-panel">
    <span className="upload-icon"><LoaderCircle className="animate-spin" size={24} /></span>
    <h2>Preparing your results</h2><p className="lede">You can leave this page. Processing will continue locally.</p>
    <div className="steps">{stages.map(([key, label], index) => <div className={`step ${index === currentStage ? "step-active" : index < currentStage ? "step-done" : ""}`} key={key}>
      <span className="step-icon">{index < currentStage ? <Check size={14} /> : index + 1}</span>{label}
    </div>)}</div>
  </div>;
  if (data.batch.status === "failed") {
    const errors = JSON.parse(data.batch.errorLog || "[]") as string[];
    return <div className="card card-pad stack"><span className="upload-icon"><AlertCircle size={24} /></span><h2>Processing paused</h2>
      <div className="alert alert-error">{errors[0] || "The survey could not be processed."}</div>
      <button className="button button-primary" disabled={retrying} onClick={async () => { setRetrying(true); await fetch(`/api/surveys/${batchId}/retry`, { method: "POST" }); setRetrying(false); void refresh(); }}><RotateCcw size={16} />{retrying ? "Retrying…" : "Retry processing"}</button>
    </div>;
  }
  return <>
    <div className="page-head"><div><p className="eyebrow">Survey results</p><h1>{data.batch.filename}</h1></div>
      {data.problems.length > 0 && <button className="button button-primary" onClick={() => router.push(`/review/${batchId}`)}>{actionLabel}<ArrowRight size={17} /></button>}
    </div>
    <div className="stats">
      <div className="stat"><div className="stat-value">{data.batch.villageCount}</div><div className="stat-label">Villages processed</div></div>
      <div className="stat"><div className="stat-value">{data.problems.length}</div><div className="stat-label">Problems found</div></div>
      <div className="stat"><div className="stat-value">{data.batch.attentionCount}</div><div className="stat-label">Need attention</div></div>
      <div className="stat"><div className="stat-value">{reviewPercent}%</div><div className="stat-label">Review complete</div></div>
    </div>
    {!data.problems.length ? <div className="card empty"><h2>No problems were extracted</h2><p>This can mean that all covered needs were met, or that the current rules do not cover this survey.</p><Link className="text-link" href="/surveys">Return to surveys</Link></div>
      : <div className="problem-list">{data.problems.map((problem) => {
        const confidence = problem.classificationStatus !== "classified" || problem.confidence === null ? "Classification unavailable" : problem.confidence >= .6 ? "High confidence" : "Review suggested";
        return <article className="problem-row" key={problem.id}><div className="problem-main"><div><h3>{problem.statement}</h3>
          <div className="problem-meta"><span>{problem.village}</span><span>·</span><span>{problem.track || "Track unavailable"}</span><StatusPill status={confidence} /></div></div><StatusPill status={problem.status} /></div>
          <details><summary>Why was this identified?</summary><div className="detail-box">{problem.rationale}<br /><strong>Survey questions:</strong> {problem.sourceQuestionIds.join(", ")}</div></details>
        </article>;
      })}</div>}
  </>;
}
