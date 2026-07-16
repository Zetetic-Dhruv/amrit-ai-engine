export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = ["complete", "ready", "approved"].includes(normalized)
    ? "green" : ["failed", "rejected", "unavailable"].includes(normalized)
      ? "red" : ["processing", "in_progress", "review suggested"].includes(normalized)
        ? "amber" : "neutral";
  const label = normalized === "in_progress" ? "In progress" : status.replaceAll("_", " ");
  return <span className={`pill pill-${tone}`}><span className="dot" />{label}</span>;
}
