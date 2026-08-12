import { z } from "zod";
export const dataSourceProviderSchema = z.enum(["own", "frappe"]);
export const frappeConnectionSchema = z.object({
  apiKey: z.string().trim().max(2000),
  apiSecret: z.string().trim().max(2000),
  connectionName: z.string().trim().min(1, "Connection name is required.").max(160),
  enabled: z.boolean(),
  saveToEnvironment: z.boolean(),
  url: z.string().trim().url("Enter a valid Frappe URL.").max(500)
});
