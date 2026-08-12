import { z } from "zod";

export const honeyPromptSchema = z
  .object({
    message: z.string().trim().min(1).max(20_000),
    mode: z.enum(["chat", "content-writer"])
  })
  .strict();
