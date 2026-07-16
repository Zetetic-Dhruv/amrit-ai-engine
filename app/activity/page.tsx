import { desc } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function ActivityPage() {
  const rows = db.select().from(events).orderBy(desc(events.createdAt)).limit(200).all();
  return <AppShell><main className="main"><div className="page-head"><div><p className="eyebrow">Read-only history</p><h1>Activity</h1><p className="lede">A simple record of processing and review decisions.</p></div></div>
    <div className="table-card">{rows.length ? <table className="table"><thead><tr><th>Event</th><th>Actor</th><th>Time</th><th>Outcome</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><details style={{ margin: 0 }}><summary>{row.eventType.replaceAll("_", " ")}</summary><div className="detail-box"><pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(safeJson(row.detail, {}), null, 2)}</pre></div></details></td><td>{row.actor}</td><td>{new Date(row.createdAt).toLocaleString()}</td><td>{row.outcome}</td></tr>)}</tbody></table> : <div className="empty">Activity will appear after the first upload.</div>}</div>
  </main></AppShell>;
}
