import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { SessionDto } from "@cxshop/contracts";
import { IdentityService } from "../../identity/identity.service";
import { CatalogService } from "../application/catalog.service";

export function registerCatalogRoutes(app: FastifyInstance, service: CatalogService, identity: IdentityService, cookieName: string) {
  app.get("/v1/store/categories", async () => ({ items: await service.listStoreCategories() }));
  app.get("/v1/store/products", async request => ({ items: await service.listStoreProducts(categoryQuery(request)) }));
  app.get("/v1/store/products/:slug", async (request, reply) => {
    const product = await service.getStoreProduct(String((request.params as { slug: string }).slug));
    return product ?? reply.code(404).send({ error: { code: "CATALOG_PRODUCT_NOT_FOUND" } });
  });
  app.get("/v1/admin/catalog/categories", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.catalog.read");
    return session ? { items: await service.listAdminCategories() } : reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
  });
  app.post("/v1/admin/catalog/categories", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.catalog.write");
    if (!session) return reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
    return reply.code(201).send(await service.createCategory(request.body, session.actorId, correlationId(request)));
  });
  app.get("/v1/admin/catalog/products", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.catalog.read");
    return session ? { items: await service.listAdminProducts() } : reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
  });
  app.post("/v1/admin/catalog/products", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.catalog.write");
    if (!session) return reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
    return reply.code(201).send(await service.createProduct(request.body, session.actorId, correlationId(request)));
  });
}

async function authorize(request: FastifyRequest, identity: IdentityService, cookieName: string, permission: string): Promise<SessionDto | undefined> {
  const token = request.cookies[cookieName];
  const session = token ? await identity.verify(token, "admin") : undefined;
  return session?.permissions.includes(permission) ? session : undefined;
}

function categoryQuery(request: FastifyRequest): string | undefined {
  const value = (request.query as { category?: unknown }).category;
  return typeof value === "string" && value.length <= 120 ? value : undefined;
}

function correlationId(request: FastifyRequest): string {
  const value = request.headers["x-correlation-id"];
  return typeof value === "string" && /^[0-9a-f-]{36}$/iu.test(value) ? value : randomUUID();
}
