import type { FastifyInstance } from "fastify";
import { registerContractRoute } from "@cxshop/framework/http";
import { z } from "zod";
import { TaxonomyService } from "./taxonomy.service.js";
const service = new TaxonomyService();
const kind = z.enum(["category", "tag"]),
  status = z.enum(["active", "inactive"]);
const payload = z.object({
  kind,
  name: z.string().min(1).max(191),
  slug: z.string().max(191).default(""),
  description: z.string().max(500).default(""),
  status: status.default("active")
});
const record = payload.extend({
  id: z.number(),
  uuid: z.string().length(8),
  createdAt: z.string(),
  updatedAt: z.string()
});
export async function registerTaxonomyRoutes(app: FastifyInstance) {
  registerContractRoute(app, {
    method: "GET",
    url: "/blogs/taxonomy",
    schemas: { querystring: z.object({ kind: kind.optional() }), response: z.array(record) },
    handler: ({ query }) => service.list(query.kind)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/public/blog-taxonomy",
    schemas: { querystring: z.object({ kind: kind.optional() }), response: z.array(record) },
    handler: ({ query }) => service.list(query.kind)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/blogs/taxonomy",
    schemas: { body: payload, response: record },
    handler: async ({ body }) => required(await service.save(body))
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/blogs/taxonomy/:id",
    schemas: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: payload,
      response: record
    },
    handler: async ({ params, body }) => required(await service.save(body, params.id))
  });
}
function required<T>(value: T | null): T {
  if (!value) throw new Error("Taxonomy record was not found.");
  return value;
}
