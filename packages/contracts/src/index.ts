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

export const catalogStatusSchema = z.enum(["draft", "active", "archived"]);
export const categorySchema = z.object({
  id: z.string().uuid(), name: z.string(), slug: z.string(), description: z.string(), status: catalogStatusSchema,
  productCount: z.number().int().nonnegative().default(0)
});
export const productSummarySchema = z.object({
  id: z.string().uuid(), key: z.string(), name: z.string(), slug: z.string(), summary: z.string(),
  status: catalogStatusSchema, category: z.string().nullable(), imageUrl: z.string().nullable()
});
export const productDetailSchema = productSummarySchema.extend({
  description: z.string(), variants: z.array(z.object({ id: z.string().uuid(), sku: z.string(), name: z.string() }))
});
export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500), status: catalogStatusSchema.default("draft")
});
export const createProductSchema = z.object({
  key: z.string().trim().regex(/^[A-Z0-9][A-Z0-9-]{1,38}$/), name: z.string().trim().min(2).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(10_000), categoryId: z.string().uuid(), status: catalogStatusSchema.default("draft")
});
export type CategoryDto = z.infer<typeof categorySchema>;
export type ProductSummaryDto = z.infer<typeof productSummarySchema>;
export type ProductDetailDto = z.infer<typeof productDetailSchema>;

export const salesEnquirySchema = z.object({
  requestId: z.string().uuid(), productId: z.string().uuid(), variantId: z.string().uuid().optional(),
  customerName: z.string().trim().min(2).max(120), customerPhone: z.string().trim().regex(/^\+?[0-9]{8,15}$/),
  quantity: z.coerce.number().int().min(1).max(20), note: z.string().trim().max(1_000).default(""), consent: z.literal(true)
});
export const walkInOrderStatusSchema = z.enum(["confirmed", "billed", "ready_for_collection", "collected", "cancelled"]);
export const orderTransitionSchema = z.object({
  status: walkInOrderStatusSchema, reason: z.string().trim().min(2).max(500), totalMinor: z.coerce.number().int().nonnegative().optional(),
  billNumber: z.string().trim().min(3).max(40).optional(), collectionNote: z.string().trim().max(500).optional()
});
export type SalesEnquiryInput = z.infer<typeof salesEnquirySchema>;
export type WalkInOrderStatus = z.infer<typeof walkInOrderStatusSchema>;
