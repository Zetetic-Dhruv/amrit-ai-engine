"use client";

import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type ModelStatus = { available: boolean; models: string[]; chatModel: string; embedModel: string };

export function ModelStatusCard() {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  async function check() { setStatus(null); setStatus(await fetch("/api/status/ollama", { cache: "no-store" }).then((response) => response.json())); }
  useEffect(() => {
    let active = true;
    fetch("/api/status/ollama", { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (active) setStatus(result);
    });
    return () => { active = false; };
  }, []);
  return <div className="card card-pad">
    <div className="section-head"><div><h3>Local processing</h3><p className="small muted">AMRIT uses models running on this computer.</p></div>
      <button className="button button-secondary" onClick={check}><RefreshCw size={15} /> Check</button></div>
    {!status ? <p className="muted">Checking…</p> : status.available
      ? <div className="alert alert-success"><CheckCircle2 size={16} style={{ display: "inline", marginRight: 8 }} />Local processing is available.<div className="small" style={{ marginTop: 6 }}>{status.chatModel} · {status.embedModel}</div></div>
      : <div className="alert alert-error"><CircleAlert size={16} style={{ display: "inline", marginRight: 8 }} />Ollama is not running. Install and start Ollama, then pull <strong>{status.chatModel}</strong> and <strong>{status.embedModel}</strong>.</div>}
  </div>;
}
