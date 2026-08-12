import type { FastifyInstance } from "fastify";
import { registerContractRoute } from "@cxshop/framework/http";
import { z } from "zod";
import { DiscussionService } from "./discussion.service.js";
const service = new DiscussionService(),
  kind = z.enum(["comment", "review"]),
  payload = z.object({
    articleId: z.number().int().positive(),
    parentId: z.number().int().positive().nullable().default(null),
    kind,
    authorName: z.string().min(1).max(191),
    authorEmail: z.string().email().max(320),
    body: z.string().min(1).max(5000),
    rating: z.number().int().min(1).max(5).nullable().default(null)
  }),
  record = payload.extend({
    id: z.number(),
    uuid: z.string(),
    status: z.enum(["pending", "approved", "rejected"]),
    createdAt: z.string(),
    updatedAt: z.string()
  });
export async function registerDiscussionRoutes(app: FastifyInstance) {
  registerContractRoute(app, {
    method: "GET",
    url: "/blogs/discussions",
    schemas: {
      querystring: z.object({ articleId: z.coerce.number().int().positive().optional() }),
      response: z.array(record)
    },
    handler: ({ query }) => service.list(query.articleId)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/public/blog/discussions",
    schemas: { body: payload, response: record },
    handler: async ({ body }) => required(await service.create(body))
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/public/blog/:articleId/discussions",
    schemas: {
      params: z.object({ articleId: z.coerce.number().int().positive() }),
      response: z.array(record)
    },
    handler: ({ params }) => service.list(params.articleId, true)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/blogs/discussions/:id/moderate",
    schemas: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: z.object({ status: z.enum(["approved", "rejected"]) }),
      response: record
    },
    handler: async ({ params, body }) => required(await service.moderate(params.id, body.status))
  });
}
function required<T>(value: T | null): T {
  if (!value) throw new Error("Discussion was not found.");
  return value;
}
