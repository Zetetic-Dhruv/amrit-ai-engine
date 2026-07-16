import { createHash, randomUUID } from "node:crypto";

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export const hashBuffer = (value: Buffer) => createHash("sha256").update(value).digest("hex");

export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    aNorm += a[index] ** 2;
    bNorm += b[index] ** 2;
  }
  return aNorm && bNorm ? dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm)) : 0;
}

export function confidenceLabel(value: number | null, status = "classified") {
  if (status !== "classified" || value === null) return "Classification unavailable";
  return value >= 0.6 ? "High confidence" : "Review suggested";
}
