import http from "node:http";

const server = http.createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
  response.setHeader("content-type", "application/json");
  if (request.url === "/api/tags") return response.end(JSON.stringify({ models: [{ name: "qwen2.5:14b" }, { name: "nomic-embed-text" }] }));
  if (request.url === "/api/embed") {
    const text = String(body.input || "").toLowerCase();
    const words = ["water", "irrigation", "health", "waste", "livelihood", "connectivity"];
    return response.end(JSON.stringify({ embeddings: [[...words.map((word) => text.includes(word) ? 1 : .08), (text.length % 13) / 13]] }));
  }
  if (request.url === "/api/generate") {
    const prompt = String(body.prompt || "");
    if (prompt.includes("Candidate problems")) {
      const trackPairs = [
        ["water", "Drinking Water"], ["irrigation", "Agriculture and Allied Services"],
        ["healthcare", "Healthcare"], ["waste", "Sanitation and Waste Management"],
        ["livelihood", "Livelihoods and Entrepreneurship"], ["connectivity", "Rural Connectivity"],
      ];
      const candidateBlock = prompt.split("Candidate problems:")[1] || "[]";
      const candidates = JSON.parse(candidateBlock.split("\n\nMerge")[0].trim());
      const problems = candidates.map((candidate) => ({
        statement: candidate.statement,
        track: trackPairs.find(([word]) => candidate.statement.toLowerCase().includes(word))?.[1] || "Village Governance",
        confidence: .88,
        rationale: "The survey response directly indicates this unmet village need.",
        sourceQuestionIds: candidate.sourceQuestionIds,
        urgency: candidate.urgency,
        importance: candidate.importance,
      }));
      return response.end(JSON.stringify({ response: JSON.stringify({ problems }) }));
    }
    const ids = [...prompt.matchAll(/"providerId":"([0-9a-f-]{36})"/g)].map((match) => match[1]);
    return response.end(JSON.stringify({ response: JSON.stringify({ matches: ids.slice(0, 5).map((providerId, index) => ({
      providerId,
      explanation: index === 0
        ? "This provider directly addresses the stated village need with a practical rural deployment model. A reviewer should confirm local capacity and fit."
        : "This provider offers a related solution that could address part of the need. A reviewer should confirm the operating context and delivery readiness.",
    })) }) }));
  }
  response.statusCode = 404; response.end("{}");
});

server.listen(11434, "127.0.0.1", () => console.log("Development-only Ollama mock listening on http://127.0.0.1:11434"));
