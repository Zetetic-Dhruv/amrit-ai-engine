import * as XLSX from "xlsx";
import type { AnswerValue, ParseResult, ParsedProvider, ParsedVillage } from "./types";

const questionPattern = /^Q\d+(?:\.\d+)*$/i;

function rowsFromWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) throw new Error("The workbook does not contain a worksheet.");
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
    defval: "",
    raw: false,
  });
}

function normalizeAnswer(value: unknown): AnswerValue | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "yes" || normalized === "y") return "Yes";
  if (normalized === "no" || normalized === "n") return "No";
  if (["na", "n/a", "not applicable"].includes(normalized)) return "NA";
  return null;
}

export function parseSurvey(buffer: Buffer): ParseResult<ParsedVillage> {
  const source = rowsFromWorkbook(buffer);
  if (!source.length) return { rows: [], errors: ["The worksheet is empty."] };
  const headers = Object.keys(source[0]);
  if (!headers.includes("Village Name")) {
    return { rows: [], errors: ['Required column "Village Name" is missing.'] };
  }
  const questionHeaders = headers.filter((header) => questionPattern.test(header.trim()));
  if (!questionHeaders.length) {
    return { rows: [], errors: ["No question columns were found. Use question IDs such as Q1 or Q1.1."] };
  }

  const rows: ParsedVillage[] = [];
  const errors: string[] = [];
  source.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = String(row["Village Name"] ?? "").trim();
    if (!name) {
      errors.push(`Row ${rowNumber}: Village Name is blank.`);
      return;
    }
    const answers: Record<string, AnswerValue> = {};
    let valid = true;
    for (const question of questionHeaders) {
      const value = normalizeAnswer(row[question]);
      if (!value) {
        errors.push(`Row ${rowNumber}: ${question} must be Yes, No, or NA.`);
        valid = false;
      } else {
        answers[question.toUpperCase()] = value;
      }
    }
    if (valid) rows.push({ name, answers });
  });
  return { rows, errors };
}

export function parseCatalogue(buffer: Buffer): ParseResult<ParsedProvider> {
  const source = rowsFromWorkbook(buffer);
  if (!source.length) return { rows: [], errors: ["The catalogue is empty."] };
  const headers = Object.keys(source[0]);
  const missing = ["Provider Name", "Description"].filter((header) => !headers.includes(header));
  if (missing.length) {
    return { rows: [], errors: [`Required column${missing.length > 1 ? "s" : ""} missing: ${missing.join(", ")}.`] };
  }
  const rows: ParsedProvider[] = [];
  const errors: string[] = [];
  source.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = String(row["Provider Name"] ?? "").trim();
    const description = String(row.Description ?? "").trim();
    if (!name || !description) {
      errors.push(`Row ${rowNumber}: Provider Name and Description are required.`);
      return;
    }
    rows.push({
      name,
      description,
      trackTags: String(row["Track Tags"] ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      contactName: String(row["Contact Name"] ?? "").trim() || undefined,
      contactEmail: String(row["Contact Email"] ?? "").trim() || undefined,
      contactPhone: String(row["Contact Phone"] ?? "").trim() || undefined,
    });
  });
  return { rows, errors };
}

export function applyRules(answers: Record<string, AnswerValue>, rules: import("./types").Rule[]) {
  return rules
    .filter((rule) => Object.entries(rule.all).every(([question, expected]) => answers[question.toUpperCase()] === expected))
    .map((rule) => ({
      statement: rule.problem_statement,
      urgency: rule.urgency,
      importance: rule.importance,
      sourceQuestionIds: Object.keys(rule.all),
    }));
}
