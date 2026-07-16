"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadCard } from "./upload-card";
import { StatusPill } from "./status-pill";

type Batch = {
  id: string; filename: string; status: string; villageCount: number; problemCount: number;
  createdAt: string; progress: { decided: number; total: number };
};

export function SurveyHome({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  return <>
    <UploadCard accept=".xlsx" title="Upload a village survey" hint="Drop an XLSX workbook here and AMRIT will prepare it for review."
      buttonLabel="Find village needs" endpoint="/api/surveys"
      onUploaded={(result) => router.push(`/surveys/${result.batchId}`)} />
    <div style={{ marginTop: 12, textAlign: "center" }}>
      <a className="text-link" href="/templates/village-survey-template.xlsx" download><Download size={14} /> Download survey template</a>
    </div>
    <section className="section">
      <div className="section-head"><h2>Recent surveys</h2></div>
      <div className="table-card">
        {batches.length ? <table className="table">
          <thead><tr><th>Survey</th><th>Villages</th><th>Review progress</th><th>Status</th><th /></tr></thead>
          <tbody>{batches.map((batch) => <tr key={batch.id}>
            <td><div className="row-title">{batch.filename}</div><div className="row-sub">{new Date(batch.createdAt).toLocaleDateString()}</div></td>
            <td>{batch.villageCount}</td>
            <td>{batch.progress.total ? `${batch.progress.decided} of ${batch.progress.total}` : batch.problemCount ? "Not started" : "—"}</td>
            <td><StatusPill status={batch.status} /></td>
            <td><Link className="text-link" href={`/surveys/${batch.id}`}>View results <ExternalLink size={13} /></Link></td>
          </tr>)}</tbody>
        </table> : <div className="empty">Your uploaded surveys will appear here.</div>}
      </div>
    </section>
  </>;
}
