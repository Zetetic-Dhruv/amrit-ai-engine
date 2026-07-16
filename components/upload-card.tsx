"use client";

import { FileCheck2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  accept: string;
  title: string;
  hint: string;
  buttonLabel: string;
  endpoint: string;
  onUploaded: (result: Record<string, unknown>) => void;
};

export function UploadCard({ accept, title, hint, buttonLabel, endpoint, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setBusy(true); setError(null);
    const form = new FormData(); form.append("file", file);
    try {
      const response = await fetch(endpoint, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The file could not be uploaded.");
      onUploaded(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The file could not be uploaded.");
    } finally { setBusy(false); }
  }

  return <div className="card card-pad">
    <div className="upload" data-dragging={dragging}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); setFile(event.dataTransfer.files[0] || null); }}>
      <span className="upload-icon">{file ? <FileCheck2 size={25} /> : <UploadCloud size={25} />}</span>
      <h3>{title}</h3>
      <p>{hint}</p>
      {file && <div className="filename"><FileCheck2 size={15} />{file.name}</div>}
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(event) => setFile(event.target.files?.[0] || null)} />
      {!file
        ? <button className="button button-secondary" onClick={() => inputRef.current?.click()}>Choose file</button>
        : <button className="button button-primary" disabled={busy} onClick={submit}>{busy ? "Uploading…" : buttonLabel}</button>}
    </div>
    {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
  </div>;
}
