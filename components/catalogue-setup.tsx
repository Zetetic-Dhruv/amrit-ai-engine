"use client";

import Link from "next/link";
import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { UploadCard } from "./upload-card";

type Catalogue = { id: string; status: string; providerCount: number; errorLog: string[] };

export function CatalogueSetup({ compact = false }: { compact?: boolean }) {
  const [catalogueId, setCatalogueId] = useState<string | null>(null);
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);

  useEffect(() => {
    if (!catalogueId || ["ready", "failed"].includes(catalogue?.status || "")) return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/catalogues/${catalogueId}`, { cache: "no-store" });
      if (response.ok) setCatalogue(await response.json());
    }, 1200);
    return () => clearInterval(timer);
  }, [catalogueId, catalogue?.status]);

  if (catalogue?.status === "ready") return <div className="card card-pad">
    <div className="upload-icon"><Check size={24} /></div>
    <h2>Catalogue ready</h2>
    <p className="lede">{catalogue.providerCount} providers are ready to match against village needs.</p>
    {catalogue.errorLog.length > 0 && <div className="alert alert-error" style={{ marginTop: 18 }}>
      {catalogue.errorLog.length} row{catalogue.errorLog.length === 1 ? "" : "s"} need attention.
    </div>}
    <div style={{ marginTop: 24 }}><Link className="button button-primary" href="/surveys">Continue to surveys</Link></div>
  </div>;

  if (catalogueId && catalogue?.status !== "failed") return <div className="card status-panel">
    <span className="upload-icon"><LoaderCircle className="animate-spin" size={24} /></span>
    <h2>Preparing the catalogue</h2>
    <p className="lede">This runs locally and may take a few minutes. You can leave this page and return later.</p>
  </div>;

  if (catalogue?.status === "failed") return <div className="card card-pad stack">
    <div className="alert alert-error">{catalogue.errorLog[0] || "The catalogue could not be prepared."}</div>
    <button className="button button-secondary" onClick={() => { setCatalogue(null); setCatalogueId(null); }}><RotateCcw size={16} /> Choose another file</button>
  </div>;

  return <UploadCard
    accept=".xlsx,.csv"
    title={compact ? "Replace the provider catalogue" : "Load the provider catalogue"}
    hint="Drop an XLSX or CSV file here. You only need to do this once."
    buttonLabel="Prepare catalogue"
    endpoint="/api/catalogues"
    onUploaded={(result) => { setCatalogueId(String(result.catalogueId)); setCatalogue({ id: String(result.catalogueId), status: "processing", providerCount: 0, errorLog: [] }); }}
  />;
}
