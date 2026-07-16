import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "amrit-test-"));
process.env.AMRIT_DATA_DIR = testDir;
let server: http.Server;

beforeAll(async () => {
  server = http.createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    response.setHeader("content-type", "application/json");
    if (request.url === "/api/tags") return response.end(JSON.stringify({ models: [{ name: "test-chat" }, { name: "test-embed" }] }));
    if (request.url === "/api/embed") {
      const text = String(body.input || "");
      const vector = [text.includes("water") ? 1 : .2, text.length % 11 / 10, 0.5];
      return response.end(JSON.stringify({ embeddings: [vector] }));
    }
    if (request.url === "/api/generate") {
      const prompt = String(body.prompt || "");
      if (prompt.includes("Candidate problems")) return response.end(JSON.stringify({ response: JSON.stringify({ problems: [{ statement: "The village lacks reliable access to safe drinking water.", track: "Drinking Water", confidence: .91, rationale: "The survey records a direct access gap.", sourceQuestionIds: ["Q1.1"], urgency: 5, importance: 5 }] }) }));
      const providerId = prompt.match(/providerId\\?"?:\\?"([^"\\]+)/)?.[1];
      return response.end(JSON.stringify({ response: JSON.stringify({ matches: providerId ? [{ providerId, explanation: "The provider offers water systems relevant to this need. A reviewer can confirm local fit." }] : [] }) }));
    }
    response.statusCode = 404; response.end("{}");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  process.env.OLLAMA_BASE_URL = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  process.env.OLLAMA_CHAT_MODEL = "test-chat";
  process.env.OLLAMA_EMBED_MODEL = "test-embed";
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe("local processing pipeline", () => {
  it("ingests providers and produces reviewable matches", async () => {
    const [{ db, uploadsDir }, schema, pipeline, utils] = await Promise.all([
      import("@/lib/db"), import("@/lib/schema"), import("@/lib/pipeline"), import("@/lib/utils"),
    ]);
    const catalogueId = utils.id();
    const catalogueBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(catalogueBook, XLSX.utils.json_to_sheet([{ "Provider Name": "Jal Saathi", Description: "Safe water purification", "Track Tags": "Drinking Water" }]), "Providers");
    const catalogueBuffer = Buffer.from(XLSX.write(catalogueBook, { type: "buffer", bookType: "xlsx" }));
    db.insert(schema.catalogues).values({ id: catalogueId, filename: "providers.xlsx", fileHash: "c", status: "processing", createdAt: utils.now() }).run();
    fs.writeFileSync(`${uploadsDir}/catalogue-${catalogueId}`, catalogueBuffer);
    await pipeline.processCatalogue(catalogueId);

    const batchId = utils.id(); const villageId = utils.id(); const timestamp = utils.now();
    db.insert(schema.surveyBatches).values({ id: batchId, filename: "survey.xlsx", fileHash: "s", status: "processing", stage: "checking", villageCount: 1, catalogueId, createdAt: timestamp, updatedAt: timestamp }).run();
    db.insert(schema.villageSurveys).values({ id: villageId, batchId, name: "Anandpur", answers: JSON.stringify({ "Q1.1": "No" }) }).run();
    await pipeline.processSurvey(batchId);
    const details = pipeline.batchDetails(batchId);
    expect(details?.batch.status).toBe("complete");
    expect(details?.problems).toHaveLength(1);
    expect(details?.problems[0].matches).toHaveLength(1);
  });
});
