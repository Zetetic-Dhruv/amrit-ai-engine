import Link from "next/link";
import { Download, Home } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { batchDetails } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default async function CompletionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = batchDetails(id); if (!data) notFound();
  const approved = data.problems.flatMap((problem) => problem.matches.filter((match) => match.decision === "approved").map((match) => ({ problem, match })));
  const approvedGroups = data.problems.map((problem) => ({ problem, approved: problem.matches.filter((match) => match.decision === "approved") })).filter((group) => group.approved.length > 0);
  const noApproved = data.problems.filter((problem) => problem.matches.length > 0 && !problem.matches.some((match) => match.decision === "approved"));
  const noMatches = data.problems.filter((problem) => problem.matches.length === 0);
  return <AppShell><main className="main">
    <div className="page-head"><div><p className="eyebrow">Review complete</p><h1>Your shortlist is ready.</h1><p className="lede">Approved providers are grouped by the village problem they may help address.</p></div></div>
    <div className="stats">
      <div className="stat"><div className="stat-value">{data.problems.length}</div><div className="stat-label">Problems reviewed</div></div>
      <div className="stat"><div className="stat-value">{approved.length}</div><div className="stat-label">Providers approved</div></div>
      <div className="stat"><div className="stat-value">{noApproved.length}</div><div className="stat-label">Without approval</div></div>
      <div className="stat"><div className="stat-value">{noMatches.length}</div><div className="stat-label">Catalogue gaps</div></div>
    </div>
    <section className="section"><div className="section-head"><h2>Approved matches</h2></div>
      {approvedGroups.length ? <div className="problem-list">{approvedGroups.map(({ problem, approved: approvedMatches }) => <article className="problem-row" key={problem.id}>
        <p className="eyebrow">{problem.village} · {problem.track || "Track unavailable"}</p><h3>{problem.statement}</h3>
        <div className="stack" style={{ marginTop: 15 }}>{approvedMatches.map((match) => <div className="detail-box" style={{ marginTop: 0 }} key={match.id}><strong>{match.provider.name}</strong><br />{match.explanation}<br /><span className="muted">{[match.provider.contactName, match.provider.contactEmail, match.provider.contactPhone].filter(Boolean).join(" · ")}</span></div>)}</div>
      </article>)}</div> : <div className="card empty">No providers were approved in this review.</div>}
    </section>
    {(noApproved.length > 0 || noMatches.length > 0) && <section className="section"><div className="section-head"><h2>Needs another look</h2></div>
      <div className="card card-pad small muted">{noApproved.length} problem{noApproved.length === 1 ? " has" : "s have"} no approved provider. {noMatches.length} problem{noMatches.length === 1 ? " has" : "s have"} no catalogue match.</div>
    </section>}
    <div className="actions" style={{ marginTop: 34 }}><a className="button button-primary" href={`/api/export/${id}`}><Download size={17} /> Download approved matches</a><Link className="button button-secondary" href="/surveys"><Home size={17} /> Return to surveys</Link></div>
  </main></AppShell>;
}
