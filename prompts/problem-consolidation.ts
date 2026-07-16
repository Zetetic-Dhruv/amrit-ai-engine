export const problemConsolidationPromptVersion = "1.0.0";

export function problemConsolidationPrompt(
  village: string,
  candidates: unknown[],
  tracks: string[],
) {
  return `You help a human reviewer understand technology needs in one Indian village.
Return JSON only, with this exact shape:
{"problems":[{"statement":"plain language","track":"one track from the supplied list","confidence":0.0,"rationale":"one short sentence","sourceQuestionIds":["Q1.1"],"urgency":1,"importance":1}]}

Village: ${village}
Allowed tracks: ${JSON.stringify(tracks)}
Candidate problems: ${JSON.stringify(candidates)}

Merge only genuinely overlapping candidates. Preserve every source question ID. Do not invent needs.`;
}
