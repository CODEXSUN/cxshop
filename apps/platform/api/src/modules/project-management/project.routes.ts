import type { FastifyInstance } from "fastify";
import { ProjectRepository } from "./project.repository";
import { IdentityService } from "../identity/identity.service";

export function registerProjectRoutes(app: FastifyInstance, repository: ProjectRepository, identity: IdentityService, cookieName: string) {
  app.get("/v1/platform/projects", async (request, reply) => {
    const token = request.cookies[cookieName];
    const session = token ? await identity.verify(token) : undefined;
    if (!session || !["admin", "sa"].includes(session.portal) || !session.permissions.includes("platform.project.read")) return reply.code(403).send({ error: "forbidden" });
    return { items: await repository.list() };
  });
}
