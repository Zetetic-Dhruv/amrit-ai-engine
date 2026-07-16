export type AnswerValue = "Yes" | "No" | "NA";

export type ParsedVillage = {
  name: string;
  answers: Record<string, AnswerValue>;
};

export type ParsedProvider = {
  name: string;
  description: string;
  trackTags: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type ParseResult<T> = {
  rows: T[];
  errors: string[];
};

export type Rule = {
  id: string;
  all: Record<string, AnswerValue>;
  problem_statement: string;
  urgency: number;
  importance: number;
};

export type CandidateProblem = {
  statement: string;
  urgency: number;
  importance: number;
  sourceQuestionIds: string[];
};
