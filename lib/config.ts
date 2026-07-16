import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Rule } from "./types";

const root = process.cwd();

export function loadTracks(): string[] {
  return JSON.parse(fs.readFileSync(path.join(root, "config", "tracks.json"), "utf8"));
}

export function loadRules(): Rule[] {
  return YAML.parse(fs.readFileSync(path.join(root, "config", "rules.yaml"), "utf8"));
}
