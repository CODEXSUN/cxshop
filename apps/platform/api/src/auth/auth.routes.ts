import type { FastifyInstance, FastifyRequest } from "fastify";
import { fail, ok } from "@cxshop/framework/http";
import { z } from "zod";
import { AuthService } from "./auth.service.js";
import { AuthSessionRepository } from "./auth-session.repository.js";
import { clearAllSessionCookies, writeEncryptedSessionCookie } from "./session-cookie.js";
import { enforceBrowserRequestOrigin, requestHost } from "./auth-request-context.js";
import { env } from "../env.js";
import { AuthLoginAttemptRepository } from "./auth-login-attempt.repository.js";

const authService = new AuthService();
const sessions = new AuthSessionRepository();
const attempts = new AuthLoginAttemptRepository();

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get("/auth/application-context", async (request) => {
    const host = requestHost(request);
    return ok(
      {
        corporateIdRequired: false,
        host,
        mode: "application",
        tenantName: env.DEFAULT_TENANT_NAME
      },
      { requestId: request.id }
    );
  });

  app.post("/auth/development/application-login", async (request, reply) => {
    enforceBrowserRequestOrigin(request);
    if (
      env.NODE_ENV !== "development" ||
      env.DEV_AUTO_TENANT_LOGIN !== "1" ||
      env.DEFAULT_TENANT_CORPORATE_ID.trim().toUpperCase() !== "CODEXSUN"
    ) {
      return reply
        .code(404)
        .send(
          fail(
            { code: "AUTH_DEVELOPMENT_LOGIN_DISABLED", message: "Development login is disabled." },
            { requestId: request.id }
          )
        );
    }
    await replaceCurrentSession(request);
    clearAllSessionCookies(reply);
    const result = await authService.login({
      desk: "admin",
      domain: requestHost(request),
      email: env.DEFAULT_TENANT_ADMIN_EMAIL,
      password: env.DEFAULT_TENANT_ADMIN_PASSWORD
    });
    if (!result || !("tenantId" in result)) {
      return reply.code(401).send(invalidCredentials(request));
    }
    writeEncryptedSessionCookie(reply, result.accessToken);
    return ok(publicResult(request, result), {
      requestId: request.id,
      tenantId: result.tenantId
    });
  });

  app.post("/auth/login", async (request, reply) => {
    enforceBrowserRequestOrigin(request);
    const body = loginSchema.parse(request.body);
    const key = `${request.ip}:${requestHost(request)}:${body.desk}:${body.email.toLowerCase()}`;
    if (await attempts.isRateLimited(key)) {
      return reply
        .code(429)
        .send(
          fail(
            { code: "AUTH_RATE_LIMITED", message: "Too many sign-in attempts. Try again later." },
            { requestId: request.id }
          )
        );
    }
    await replaceCurrentSession(request);
    clearAllSessionCookies(reply);
    const loginInput: {
      desk: typeof body.desk;
      domain: string;
      email: string;
      password: string;
    } = {
      desk: body.desk,
      domain: requestHost(request),
      email: body.email,
      password: body.password
    };
    const result = await authService.login(loginInput);
    if (!result) {
      await attempts.recordFailure(key);
      return reply.code(401).send(invalidCredentials(request));
    }
    await attempts.clear(key);
    writeEncryptedSessionCookie(reply, result.accessToken);
    return ok(publicResult(request, result), {
      requestId: request.id,
      ...("tenantId" in result && result.tenantId ? { tenantId: result.tenantId } : {})
    });
  });

  app.get("/auth/session", async (request, reply) => {
    const auth = request.authContext;
    if (!auth) {
      return reply
        .code(401)
        .send(
          fail(
            { code: "AUTH_SESSION_EXPIRED", message: "Session expired. Please sign in again." },
            { requestId: request.id }
          )
        );
    }
    const payload = auth.payload;
    return ok(
      {
        authenticated: true,
        context: auth.session?.context,
        email: payload.email,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        name: payload.name,
        sessionIssuedAt: payload.sessionIssuedAt,
        tenantCode: payload.tenantCode,
        tenantId: payload.tenantId,
        tenantUuid: payload.tenantUuid,
        userType: payload.userType
      },
      { requestId: request.id, ...(payload.tenantId ? { tenantId: payload.tenantId } : {}) }
    );
  });

  app.post("/auth/session/reset", async (request, reply) => {
    enforceBrowserRequestOrigin(request);
    await replaceCurrentSession(request);
    clearAllSessionCookies(reply);
    return ok({ reset: true }, { requestId: request.id });
  });

  app.post("/auth/logout", async (request, reply) => {
    await replaceCurrentSession(request);
    clearAllSessionCookies(reply);
    return ok({ loggedOut: true }, { requestId: request.id });
  });
}

const loginSchema = z
  .object({
    desk: z.enum(["admin", "sa"]),
    email: z.string().trim().email().max(180),
    password: z.string().min(1).max(1024)
  })
  .strict();

function invalidCredentials(request: FastifyRequest) {
  return fail(
    { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid credentials or workspace." },
    { requestId: request.id }
  );
}

function publicResult<T extends { accessToken: string }>(request: FastifyRequest, result: T) {
  const { accessToken, ...safe } = result;
  return env.AUTH_MODE === "jwt" ||
    String(request.headers["x-auth-token-delivery"] ?? "").toLowerCase() === "bearer"
    ? { ...safe, accessToken }
    : safe;
}

async function replaceCurrentSession(request: FastifyRequest) {
  if (request.authContext?.payload.jti) await sessions.revoke(request.authContext.payload.jti);
}
