import type { HoneyMode, HoneyProvider } from "./honey.types.js";

export type HoneyRunEvent = {
  eventName: "honey.run.completed" | "honey.run.failed" | "honey.run.started";
  mode: HoneyMode;
  occurredAt: string;
  provider: HoneyProvider;
  runId: string;
  threadId: string;
};

export function createHoneyRunEvent(
  eventName: HoneyRunEvent["eventName"],
  input: Omit<HoneyRunEvent, "eventName" | "occurredAt">
): HoneyRunEvent {
  return { ...input, eventName, occurredAt: new Date().toISOString() };
}
