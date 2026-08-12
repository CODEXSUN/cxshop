import type { FastifyInstance, FastifyRequest } from "fastify";
import { AppError } from "@cxshop/framework/errors";
import { registerCoreTenantDatabaseConnection } from "@cxshop/core-api";
import { registerBillingTenantDatabaseConnection } from "@cxshop/billing-api";
import { registerEcommerceTenantDatabaseConnection } from "@cxshop/ecommerce-api";
import { getTenantDatabaseByName } from "../database/tenant-database.js";
import { AuthSessionRepository, type AuthSessionRecord } from "./auth-session.repository.js";
import { verifyAuthToken, type AuthTokenPayload } from "./jwt.js";
import { readEncryptedSessionCookie } from "./session-cookie.js";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyRequest {
    authContext?: {
      payload: AuthTokenPayload;
      session: AuthSessionRecord | null;
      source: "bearer" | "cookie";
    };
  }
}

const sessions = new AuthSessionRepository();
const publicAuthPaths = new Set([
  "/public/runtime-config",
  "/public/piko/chat",
  "/auth/login",
  "/auth/development/application-login",
  "/auth/session/reset",
  "/auth/application-context"
]);

export function registerAuthRequestContext(app: FastifyInstance) {
  app.decorateRequest("authContext", undefined);
  app.addHook("onRequest", async (request) => {
    const requestPath = request.routeOptions.url ?? request.url.split("?")[0] ?? "";
    const authentication = selectRequestAuthentication(
      bearerToken(request),
      readEncryptedSessionCookie(request)
    );
    if (!authentication) return;
    const { source, token } = authentication;

    const payload = verifyAuthToken(token);
    const session = payload ? await sessions.findActive(payload.jti) : null;
    if (!payload || (source === "cookie" && !session) || !claimsMatchSession(payload, session)) {
      if (isPublicAuthenticationPath(requestPath)) return;
      throw authenticationError("AUTH_SESSION_EXPIRED", "Session expired. Please sign in again.");
    }

    const host = requestHost(request);
    if (
      !hostMatchesClaims(host, payload) &&
      !isTrustedInternalBearerRequest(source, host, request.socket.remoteAddress)
    ) {
      if (isPublicAuthenticationPath(requestPath)) return;
      throw authenticationError(
        "AUTH_DOMAIN_MISMATCH",
        "This session is not valid for the requested domain."
      );
    }
    if (source === "cookie") enforceBrowserRequestOrigin(request, host);

    request.authContext = { payload, session, source };
    if (isPublicAuthenticationPath(requestPath)) return;

    if (payload.userType === "tenant") {
      if (payload.tenantId !== "application" || payload.tenantCode !== "CXSHOP") {
        throw authenticationError(
          "AUTH_TENANT_ACCESS_INVALID",
          "Application access is no longer valid."
        );
      }
      const connection = {
        database: env.DB_MASTER_NAME,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        user: env.DB_USER
      };
      registerCoreTenantDatabaseConnection(connection);
      registerBillingTenantDatabaseConnection(connection);
      registerEcommerceTenantDatabaseConnection(connection);
      getTenantDatabaseByName(env.DB_MASTER_NAME);
      request.headers.authorization = `Bearer ${token}`;
      request.tenantId = "application";
      const defaults = session?.context.defaultCompany;
      if (defaults) {
        request.headers["x-company-id"] ??= String(defaults.companyId);
        request.headers["x-financial-year-id"] ??= String(defaults.financialYearId);
      }
    } else {
      request.headers.authorization = `Bearer ${token}`;
    }

    if (session && Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      await sessions.touch(payload.jti);
    }
  });
}

export function isPublicAuthenticationPath(path: string) {
  return publicAuthPaths.has(path);
}

export function requestHost(request: FastifyRequest) {
  return normalizeApplicationHost(request.headers.host ?? "");
}

function bearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
}

export function selectRequestAuthentication(bearer: string, cookie: string) {
  if (cookie) return { source: "cookie" as const, token: cookie };
  if (bearer) return { source: "bearer" as const, token: bearer };
  return null;
}

function claimsMatchSession(payload: AuthTokenPayload, session: AuthSessionRecord | null) {
  if (!session) return true;
  return (
    session.jti === payload.jti &&
    session.userUuid === payload.userId &&
    session.userType === payload.userType &&
    session.tenantId === (payload.tenantId ?? null) &&
    session.tenantDbName === (payload.tenantDbName ?? null) &&
    session.loginHost === payload.loginHost &&
    session.tenantAccessMode === payload.tenantAccessMode
  );
}

function hostMatchesClaims(host: string, payload: AuthTokenPayload) {
  if (!payload.loginHost) return true;
  return host === payload.loginHost;
}

export function isTrustedInternalBearerRequest(
  source: "bearer" | "cookie",
  host: string,
  remoteAddress: string | undefined
) {
  if (source !== "bearer" || (host !== "127.0.0.1" && host !== "localhost")) return false;
  return (
    remoteAddress === "127.0.0.1" || remoteAddress === "::1" || remoteAddress === "::ffff:127.0.0.1"
  );
}

function authenticationError(code: string, message: string) {
  return new AppError({ code, message, statusCode: 401 });
}

export function enforceBrowserRequestOrigin(request: FastifyRequest, host = requestHost(request)) {
  if (request.headers["sec-fetch-site"] === "cross-site") {
    throw AppError.forbidden("Cross-site session requests are not allowed.");
  }
  const origin = request.headers.origin;
  if (!origin) return;
  try {
    if (normalizeApplicationHost(new URL(origin).hostname) !== host) {
      throw AppError.forbidden("Request origin does not match the application domain.");
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.forbidden("Request origin is invalid.");
  }
}

function normalizeApplicationHost(value: string) {
  return value.trim().toLowerCase().split(":")[0] ?? "";
}
