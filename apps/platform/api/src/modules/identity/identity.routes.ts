import type { FastifyInstance } from "fastify";
import { IdentityService } from "./identity.service";

type SessionCookieConfig = {
  name: string;
  maxAge: number;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
};

export function registerIdentityRoutes(app: FastifyInstance, service: IdentityService, cookie: SessionCookieConfig) {
  app.post("/v1/auth/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const token = await service.login(request.body);
    if (!token) return reply.code(401).send({ error: "invalid_credentials" });
    return reply.setCookie(cookie.name, token, sessionCookie(cookie)).send({ authenticated: true });
  });
  app.post("/v1/auth/development-login", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (request, reply) => {
    const token = await service.developmentLogin(request.body);
    if (!token) return reply.code(404).send({ error: "development_login_unavailable" });
    return reply.setCookie(cookie.name, token, sessionCookie(cookie)).send({ authenticated: true });
  });
  app.get("/v1/auth/session", async (request, reply) => {
    const token = request.cookies[cookie.name];
    const session = token ? await service.verify(token) : undefined;
    if (!session) return reply.code(401).send({ error: { code: "AUTH_SESSION_EXPIRED" } });
    const portal = String((request.query as { portal?: unknown }).portal ?? "");
    if (portal && session.portal !== portal) return reply.code(403).send({ error: { code: "AUTH_PORTAL_MISMATCH" } });
    return session;
  });
  app.post("/v1/auth/logout", async (_request, reply) => reply.clearCookie(cookie.name, { path: "/" }).code(204).send());
}

function sessionCookie(config: SessionCookieConfig) {
  return { httpOnly: true, secure: config.secure, sameSite: config.sameSite, path: "/", maxAge: config.maxAge };
}
