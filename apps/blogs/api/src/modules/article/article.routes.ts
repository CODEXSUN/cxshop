import type { FastifyInstance } from "fastify";
import { AppError } from "@cxshop/framework/errors";
import { registerContractRoute } from "@cxshop/framework/http";
import { z } from "zod";
import { ArticleService } from "./article.service.js";
const service = new ArticleService(),
  kind = z.enum(["post", "page"]),
  status = z.enum(["draft", "published", "archived"]);
const payload = z.object({
  kind,
  title: z.string().min(1).max(255),
  slug: z.string().max(191).default(""),
  excerpt: z.string().max(500).default(""),
  mdx: z.string().min(1),
  featuredImage: z.string().max(1000).default(""),
  imageAlt: z.string().max(255).default(""),
  authorName: z.string().min(1).max(191).default("Editorial Team"),
  authorRole: z.string().max(191).default("Technology Editor"),
  authorAvatar: z.string().max(1000).default(""),
  categoryId: z.number().int().positive().nullable().default(null),
  tagIds: z.array(z.number().int().positive()).max(30).default([]),
  seoTitle: z.string().max(191).default(""),
  seoDescription: z.string().max(320).default(""),
  canonicalUrl: z.string().max(1000).default(""),
  status: status.default("draft")
});
const record = payload.extend({
  id: z.number(),
  uuid: z.string().length(8),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export async function registerArticleRoutes(app: FastifyInstance) {
  app.get("/sitemap.xml", async (_request, reply) => {
    const articles = await service.list({ publicOnly: true });
    const origin = blogsOrigin();
    const urls = articles
      .map(
        (item) =>
          `<url><loc>${origin}/blog/${item.slug}</loc><lastmod>${item.updatedAt}</lastmod></url>`
      )
      .join("");
    return reply
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/blog</loc></url>${urls}</urlset>`
      );
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/blogs/articles",
    schemas: {
      querystring: z.object({ search: z.string().optional(), kind: kind.optional() }),
      response: z.array(record)
    },
    handler: ({ query }) =>
      service.list({
        ...(query.search ? { search: query.search } : {}),
        ...(query.kind ? { kind: query.kind } : {})
      })
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/blogs/articles",
    schemas: { body: payload, response: record },
    handler: async ({ body }) => required(await service.save(body))
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/blogs/articles/:id",
    schemas: {
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: payload,
      response: record
    },
    handler: async ({ params, body }) => required(await service.save(body, params.id))
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/public/blog",
    schemas: {
      querystring: z.object({ search: z.string().optional(), kind: kind.optional() }),
      response: z.array(record)
    },
    handler: ({ query }) =>
      service.list({
        publicOnly: true,
        ...(query.search ? { search: query.search } : {}),
        ...(query.kind ? { kind: query.kind } : {})
      })
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/public/blog/:slug",
    schemas: { params: z.object({ slug: z.string() }), response: record },
    handler: async ({ params }) => {
      const item = await service.findBySlug(params.slug, true);
      if (!item) throw AppError.notFound("Article was not found.");
      return item;
    }
  });
}
function blogsOrigin() {
  return (process.env.CXSHOP_PUBLIC_ORIGIN || "http://localhost:5173").replace(/\/$/u, "");
}
function required<T>(value: T | null): T {
  if (!value) throw AppError.notFound("Article was not found.");
  return value;
}
