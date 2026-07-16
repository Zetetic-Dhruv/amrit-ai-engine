import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { applyRules, parseCatalogue, parseSurvey } from "@/lib/parsers";

function workbook(rows: Record<string, string>[]) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Sheet 1");
  return Buffer.from(XLSX.write(book, { type: "buffer", bookType: "xlsx" }));
}

describe("survey parsing", () => {
  it("normalizes answer values", () => {
    const result = parseSurvey(workbook([{ "Village Name": "Anandpur", "Q1.1": "y", Q2: "N/A" }]));
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toEqual({ name: "Anandpur", answers: { "Q1.1": "Yes", Q2: "NA" } });
  });

  it("reports missing village names and invalid answers", () => {
    const result = parseSurvey(workbook([{ "Village Name": "", Q1: "Perhaps" }]));
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0]).toContain("Village Name");
  });
});

describe("catalogue parsing and rules", () => {
  it("reads required provider fields and optional tags", () => {
    const result = parseCatalogue(workbook([{ "Provider Name": "Jal Saathi", Description: "Water systems", "Track Tags": "Water, Energy" }]));
    expect(result.rows[0].trackTags).toEqual(["Water", "Energy"]);
  });

  it("fires only rules whose full condition is satisfied", () => {
    const result = applyRules({ Q1: "No", Q2: "Yes" }, [{ id: "r", all: { Q1: "No", Q2: "Yes" }, problem_statement: "Need", urgency: 4, importance: 5 }]);
    expect(result).toHaveLength(1);
    expect(result[0].sourceQuestionIds).toEqual(["Q1", "Q2"]);
  });
});
