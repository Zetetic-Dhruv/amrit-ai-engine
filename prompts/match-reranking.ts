export const matchRerankingPromptVersion = "1.0.0";

export function matchRerankingPrompt(problem: string, candidates: unknown[]) {
  return `Rank providers for a human reviewer. Return JSON only with this exact shape:
{"matches":[{"providerId":"id supplied below","explanation":"two short plain-language sentences"}]}

Problem: ${problem}
Candidates: ${JSON.stringify(candidates)}

Return at most five candidates, best first. Use only supplied provider IDs. Explain the practical fit without overstating evidence.`;
}
