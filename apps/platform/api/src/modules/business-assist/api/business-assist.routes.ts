import type { FastifyInstance, FastifyRequest } from "fastify";
import { BusinessAssistService, BusinessAssistUnavailableError } from "../application/business-assist.service";
import { IdentityService } from "../../identity/identity.service";

export function registerBusinessAssistRoutes(app: FastifyInstance, service: BusinessAssistService, identity: IdentityService, cookieName: string) {
  app.get("/v1/platform/business-assist/status", async (request, reply) => {
    if (!await authorized(request, identity, cookieName)) return reply.code(403).send({ error: "forbidden" });
    return service.status();
  });
  app.post("/v1/platform/business-assist/requests", async (request, reply) => {
    const actor = await authorized(request, identity, cookieName);
    if (!actor) return reply.code(403).send({ error: "forbidden" });
    try {
      return reply.code(202).send(await service.request(request.body, actor));
    } catch (error) {
      if (error instanceof BusinessAssistUnavailableError) return reply.code(503).send({ error: "business_assist_unavailable" });
      throw error;
    }
  });
  app.get("/v1/platform/business-assist/requests/:requestId", async (request, reply) => {
    const actor = await authorized(request, identity, cookieName);
    if (!actor) return reply.code(403).send({ error: "forbidden" });
    const requestId = (request.params as { requestId?: unknown }).requestId;
    if (typeof requestId !== "string") return reply.code(400).send({ error: "invalid_request_id" });
    const result = await service.result(requestId, actor);
    return result ?? reply.code(404).send({ error: "business_assist_request_not_found" });
  });
}

async function authorized(request: FastifyRequest, identity: IdentityService, cookieName: string) {
  const token = request.cookies[cookieName];
  const session = token ? await identity.verify(token) : undefined;
  if (!session || !["admin", "sa"].includes(session.portal) || !session.permissions.includes("platform.business-assist.use")) return undefined;
  return session;
}
