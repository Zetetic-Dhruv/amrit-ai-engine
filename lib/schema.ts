import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const catalogues = sqliteTable("catalogues", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  fileHash: text("file_hash").notNull(),
  status: text("status").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  providerCount: integer("provider_count").notNull().default(0),
  errorLog: text("error_log").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
});

export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  catalogueId: text("catalogue_id").notNull().references(() => catalogues.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  trackTags: text("track_tags").notNull().default("[]"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  embedding: text("embedding").notNull().default("[]"),
});

export const surveyBatches = sqliteTable("survey_batches", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  fileHash: text("file_hash").notNull().unique(),
  status: text("status").notNull(),
  stage: text("stage").notNull(),
  villageCount: integer("village_count").notNull().default(0),
  problemCount: integer("problem_count").notNull().default(0),
  attentionCount: integer("attention_count").notNull().default(0),
  errorLog: text("error_log").notNull().default("[]"),
  catalogueId: text("catalogue_id").references(() => catalogues.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const villageSurveys = sqliteTable("village_surveys", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().references(() => surveyBatches.id),
  name: text("name").notNull(),
  answers: text("answers").notNull(),
});

export const problems = sqliteTable("problems", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().references(() => surveyBatches.id),
  villageId: text("village_id").notNull().references(() => villageSurveys.id),
  statement: text("statement").notNull(),
  track: text("track"),
  confidence: real("confidence"),
  rationale: text("rationale"),
  sourceQuestionIds: text("source_question_ids").notNull().default("[]"),
  urgency: integer("urgency").notNull().default(1),
  importance: integer("importance").notNull().default(1),
  status: text("status").notNull().default("pending"),
  classificationStatus: text("classification_status").notNull().default("classified"),
  promptVersion: text("prompt_version"),
  modelVersion: text("model_version"),
  createdAt: text("created_at").notNull(),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  providerId: text("provider_id").notNull().references(() => providers.id),
  rank: integer("rank").notNull(),
  similarity: real("similarity").notNull(),
  explanation: text("explanation").notNull(),
  decision: text("decision"),
  rejectionReason: text("rejection_reason"),
  decisionAt: text("decision_at"),
  promptVersion: text("prompt_version"),
  modelVersion: text("model_version"),
  createdAt: text("created_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  actor: text("actor").notNull(),
  outcome: text("outcome").notNull(),
  detail: text("detail").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});
