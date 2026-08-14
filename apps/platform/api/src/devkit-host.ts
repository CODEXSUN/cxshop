import type { FastifyRequest } from "fastify";
import type { Kysely } from "kysely";
import {
  registerDevkitApiForHost,
  registerPikoPublicRoutes,
  type DevkitDatabase,
  type DevkitHostAdapter,
  type DevkitHostRequestContext
} from "@cxshop/devkit-api";
import { AppError } from "@cxshop/framework/errors";
import { getPlatformDatabase } from "./database/platform-database.js";
import type { PlatformDatabase } from "./database/schema.js";
import { applicationAccessContext } from "./auth/application-access-context.js";

export const devkitHostAdapter: DevkitHostAdapter = {
  async authorize({ context, request }) {
    if (context.actor.roles.includes("super_admin")) return;
    if (context.actor.roles.includes("tenant_admin") && /\/honey(?:\/|\?|$)/u.test(request.url))
      return;
    throw AppError.forbidden("DevKit is available only to Super Admin.");
  },
  async resolve(request) {
    return resolveDevkitContext(request);
  }
};

export async function registerDevkitHost(app: Parameters<typeof registerDevkitApiForHost>[0]) {
  await registerDevkitApiForHost(app, devkitHostAdapter);
  await registerPikoPublicRoutes(app, {
    resolveDatabase: () => devkitDatabase(getPlatformDatabase())
  });
}

async function resolveDevkitContext(request: FastifyRequest): Promise<DevkitHostRequestContext> {
  const payload = request.authContext?.payload;
  if (payload?.userType === "super_admin") {
    return {
      actor: {
        email: payload.email,
        id: payload.userId,
        permissions: ["devkit.access"],
        roles: ["super_admin"],
        storageScope: "master"
      },
      database: devkitDatabase(getPlatformDatabase())
    };
  }
  if (payload?.userType === "tenant") {
    const context = applicationAccessContext(request);
    await context.authorize("platform.application.honey.access");
    return {
      actor: {
        email: payload.email,
        id: payload.userId,
        permissions: ["platform.application.honey.access"],
        roles: ["tenant_admin"],
        storageScope: "application"
      },
      database: isGlobalMascotRequest(request)
        ? devkitDatabase(getPlatformDatabase())
        : devkitDatabase(context.database as unknown as Kysely<PlatformDatabase>)
    };
  }
  throw AppError.forbidden("DevKit is available only to Super Admin.");
}

function isGlobalMascotRequest(request: FastifyRequest) {
  return /\/honey\/system\/mascot(?:\?|$)/u.test(request.url);
}

function devkitDatabase(database: Kysely<PlatformDatabase>): Kysely<DevkitDatabase> {
  return database as unknown as Kysely<DevkitDatabase>;
}
