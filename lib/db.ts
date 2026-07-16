import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dataDir = process.env.AMRIT_DATA_DIR || path.join(process.cwd(), ".data");
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });

const client = new Database(path.join(dataDir, "amrit.sqlite"));
client.pragma("journal_mode = WAL");
client.pragma("foreign_keys = ON");

client.exec(`
  CREATE TABLE IF NOT EXISTS catalogues (
    id TEXT PRIMARY KEY, filename TEXT NOT NULL, file_hash TEXT NOT NULL,
    status TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 0,
    provider_count INTEGER NOT NULL DEFAULT 0, error_log TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY, catalogue_id TEXT NOT NULL REFERENCES catalogues(id),
    name TEXT NOT NULL, description TEXT NOT NULL, track_tags TEXT NOT NULL DEFAULT '[]',
    contact_name TEXT, contact_email TEXT, contact_phone TEXT,
    embedding TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS survey_batches (
    id TEXT PRIMARY KEY, filename TEXT NOT NULL, file_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, stage TEXT NOT NULL, village_count INTEGER NOT NULL DEFAULT 0,
    problem_count INTEGER NOT NULL DEFAULT 0, attention_count INTEGER NOT NULL DEFAULT 0,
    error_log TEXT NOT NULL DEFAULT '[]', catalogue_id TEXT REFERENCES catalogues(id),
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS village_surveys (
    id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES survey_batches(id),
    name TEXT NOT NULL, answers TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES survey_batches(id),
    village_id TEXT NOT NULL REFERENCES village_surveys(id), statement TEXT NOT NULL,
    track TEXT, confidence REAL, rationale TEXT, source_question_ids TEXT NOT NULL DEFAULT '[]',
    urgency INTEGER NOT NULL DEFAULT 1, importance INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', classification_status TEXT NOT NULL DEFAULT 'classified',
    prompt_version TEXT, model_version TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY, problem_id TEXT NOT NULL REFERENCES problems(id),
    provider_id TEXT NOT NULL REFERENCES providers(id), rank INTEGER NOT NULL,
    similarity REAL NOT NULL, explanation TEXT NOT NULL, decision TEXT,
    rejection_reason TEXT, decision_at TEXT, prompt_version TEXT, model_version TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY, event_type TEXT NOT NULL, actor TEXT NOT NULL,
    outcome TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS providers_catalogue_idx ON providers(catalogue_id);
  CREATE INDEX IF NOT EXISTS villages_batch_idx ON village_surveys(batch_id);
  CREATE INDEX IF NOT EXISTS problems_batch_idx ON problems(batch_id);
  CREATE INDEX IF NOT EXISTS matches_problem_idx ON matches(problem_id);
`);

export const db = drizzle(client, { schema });
export const sqlite = client;
export const uploadsDir = path.join(dataDir, "uploads");
