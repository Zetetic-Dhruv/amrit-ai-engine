import { db } from "./db";
import { events } from "./schema";
import { id, now } from "./utils";

export function recordEvent(eventType: string, outcome: string, detail: unknown, actor = "System") {
  db.insert(events).values({
    id: id(), eventType, actor, outcome,
    detail: JSON.stringify(detail), createdAt: now(),
  }).run();
}
