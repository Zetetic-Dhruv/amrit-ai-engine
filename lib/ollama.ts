import { z } from "zod";

const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
export const chatModel = process.env.OLLAMA_CHAT_MODEL || "qwen2.5:14b";
export const embedModel = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export async function ollamaStatus() {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return { available: false, models: [] as string[] };
    const data = await response.json() as { models?: { name: string }[] };
    return { available: true, models: data.models?.map((model) => model.name) ?? [] };
  } catch {
    return { available: false, models: [] as string[] };
  }
}

export async function embed(text: string): Promise<number[]> {
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: embedModel, input: text }),
  });
  if (!response.ok) throw new Error(`Local embedding request failed (${response.status}).`);
  const data = await response.json() as { embeddings?: number[][] };
  if (!data.embeddings?.[0]?.length) throw new Error("The local embedding model returned no result.");
  return data.embeddings[0];
}

export async function generateStructured<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: chatModel,
          prompt: attempt === 0 ? prompt : `${prompt}\nYour previous response was invalid. Return only valid JSON in the specified shape.`,
          stream: false,
          format: "json",
          options: { temperature: 0.1 },
        }),
      });
      if (!response.ok) throw new Error(`Local language model request failed (${response.status}).`);
      const data = await response.json() as { response?: string };
      return schema.parse(JSON.parse(data.response || "{}"));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("The local model returned an invalid result twice.");
}
