import { z } from "zod";
export const cloudConnectionSchema = z
  .object({
    enabled: z.boolean(),
    password: z.string().max(2000).optional(),
    siteUrl: z
      .url("Enter a valid HTTPS site URL.")
      .refine((value) => value.startsWith("https://"), "Production site must use HTTPS."),
    user: z.string().trim().max(191)
  })
  .strict();
