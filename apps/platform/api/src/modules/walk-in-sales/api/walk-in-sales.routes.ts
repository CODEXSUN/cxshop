import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { SessionDto } from "@cxshop/contracts";
import { IdentityService } from "../../identity/identity.service";
import { WalkInSalesService } from "../application/walk-in-sales.service";

export function registerWalkInSalesRoutes(app: FastifyInstance, service: WalkInSalesService, identity: IdentityService, cookieName: string) {
  app.post("/v1/store/enquiries", { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } }, async (request, reply) => {
    try { return reply.code(201).send(await service.createEnquiry(request.body)); }
    catch (error) { return knownError(reply, error); }
  });
  app.get("/v1/admin/walk-in-orders", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.order.read");
    return session ? { items: await service.listCases() } : reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
  });
  app.post("/v1/admin/walk-in-orders/:id/transition", async (request, reply) => {
    const session = await authorize(request, identity, cookieName, "platform.order.write");
    if (!session) return reply.code(403).send({ error: { code: "AUTH_FORBIDDEN" } });
    try { return await service.transition(String((request.params as { id: string }).id), request.body, session.actorId, correlationId(request)); }
    catch (error) { return knownError(reply, error); }
  });
}
async function authorize(request: FastifyRequest, identity: IdentityService, cookieName: string, permission: string): Promise<SessionDto | undefined> { const token = request.cookies[cookieName]; const session = token ? await identity.verify(token, "admin") : undefined; return session?.permissions.includes(permission) ? session : undefined; }
function correlationId(request: FastifyRequest): string { const value = request.headers["x-correlation-id"]; return typeof value === "string" && /^[0-9a-f-]{36}$/iu.test(value) ? value : randomUUID(); }
function knownError(reply: FastifyReply, error: unknown) {
  const code = error instanceof Error ? error.message : "SALES_REQUEST_FAILED";
  const status = code === "SALES_CASE_NOT_FOUND" ? 404 : code.startsWith("ORDER_") ? 409 : code.includes("not found") ? 404 : 400;
  return reply.code(status).send({ error: { code } });
}
