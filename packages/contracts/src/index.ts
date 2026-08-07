import { z } from "zod";

export const portalSchema = z.enum(["store", "vendor", "admin", "sa"]);
export type Portal = z.infer<typeof portalSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
  portal: portalSchema
});

export const sessionSchema = z.object({
  actorId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  portal: portalSchema,
  permissions: z.array(z.string()),
  vendorId: z.string().uuid().optional()
});

export const projectSchema = z.object({
  id: z.string().uuid(),
  key: z.string().regex(/^[A-Z][A-Z0-9]{1,11}$/),
  name: z.string().min(2).max(120),
  status: z.enum(["planned", "active", "blocked", "complete"])
});

export type SessionDto = z.infer<typeof sessionSchema>;
export type ProjectDto = z.infer<typeof projectSchema>;

export const businessAssistRequestSchema = z.object({
  question: z.string().trim().min(10).max(4_000),
  area: z.enum(["catalog", "vendor-operations", "customer-experience", "finance", "growth", "general"]),
  context: z.record(z.string(), z.string().max(500)).default({})
});

export const businessAssistReceiptSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["queued", "processing", "complete", "failed"])
});

export type BusinessAssistRequest = z.infer<typeof businessAssistRequestSchema>;
export type BusinessAssistReceipt = z.infer<typeof businessAssistReceiptSchema>;

export const businessAssistResultSchema = businessAssistReceiptSchema.extend({
  response: z.string().nullable(),
  errorCode: z.string().nullable()
});
export type BusinessAssistResult = z.infer<typeof businessAssistResultSchema>;
