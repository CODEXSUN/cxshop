import type { HoneyMode, HoneyProvider } from "./honey.types.js";

export function planHoneyExecution(mode: HoneyMode, provider: HoneyProvider) {
  return mode === "content-writer"
    ? {
        roles: ["researcher", "editor", "seo-reviewer", `publisher:${provider}`],
        synchronous: true as const
      }
    : { roles: [`assistant:${provider}`], synchronous: true as const };
}
