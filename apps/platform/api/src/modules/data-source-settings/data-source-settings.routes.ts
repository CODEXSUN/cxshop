import type { FastifyInstance } from "fastify";
import { registerContractRoute } from "@cxshop/framework/http";
import { z } from "zod";
import { requireSuperAdmin } from "../../auth/super-admin.guard.js";
import { DataSourceSettingsService } from "./data-source-settings.service.js";

const provider = z.enum(["own", "frappe"]);
const settings = z
  .object({
    availableProviders: z.array(provider),
    appKeyConfigured: z.boolean(),
    appSecretConfigured: z.boolean(),
    connectionName: z.string(),
    envProvider: provider,
    frappeConfigured: z.boolean(),
    frappeEnabled: z.boolean(),
    frappeUrl: z.string().nullable(),
    lastCheckedAt: z.string().nullable(),
    lastVerifiedAt: z.string().nullable(),
    provider,
    providerLabel: z.string(),
    updatedAt: z.string().nullable(),
    updatedBy: z.string(),
    saveToEnvironment: z.boolean(),
    verificationStatus: z.enum(["live", "offline", "unverified"]),
    verifiedUser: z.string().nullable()
  })
  .strict();
const connection = z
  .object({
    connected: z.boolean(),
    latencyMs: z.number().nonnegative(),
    message: z.string(),
    provider,
    providerLabel: z.string()
  })
  .strict();
const optionalSecret = z.string().trim().max(2000).optional();
const frappeVerification = z
  .object({
    apiKey: optionalSecret,
    apiSecret: optionalSecret,
    url: z.string().trim().min(1).max(500)
  })
  .strict();
const frappeSave = frappeVerification
  .extend({
    connectionName: z.string().trim().min(1).max(160),
    enabled: z.boolean(),
    saveToEnvironment: z.boolean()
  })
  .strict();

export async function registerDataSourceSettingsRoutes(app: FastifyInstance) {
  const service = new DataSourceSettingsService();
  registerContractRoute(app, {
    method: "GET",
    url: "/admin/data-source/settings",
    preHandler: requireSuperAdmin,
    schemas: { response: settings },
    handler: () => service.settings()
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/admin/data-source/settings/provider",
    preHandler: requireSuperAdmin,
    schemas: { body: z.object({ provider }).strict(), response: settings },
    handler: ({ body, request }) =>
      service.switchProvider(body.provider, request.authContext?.payload.email ?? "super-admin")
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/admin/data-source/connections/:provider/test",
    preHandler: requireSuperAdmin,
    schemas: { params: z.object({ provider }).strict(), response: connection },
    handler: ({ params }) => service.test(params.provider)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/admin/data-source/frappe/verify",
    preHandler: requireSuperAdmin,
    schemas: { body: frappeVerification, response: connection },
    handler: ({ body }) =>
      service.verifyFrappe({
        url: body.url,
        ...(body.apiKey ? { apiKey: body.apiKey } : {}),
        ...(body.apiSecret ? { apiSecret: body.apiSecret } : {})
      })
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/admin/data-source/frappe",
    preHandler: requireSuperAdmin,
    schemas: { body: frappeSave, response: settings },
    handler: ({ body, request }) =>
      service.saveFrappe(
        {
          connectionName: body.connectionName,
          enabled: body.enabled,
          saveToEnvironment: body.saveToEnvironment,
          url: body.url,
          ...(body.apiKey ? { apiKey: body.apiKey } : {}),
          ...(body.apiSecret ? { apiSecret: body.apiSecret } : {})
        },
        request.authContext?.payload.email ?? "super-admin"
      )
  });
}
