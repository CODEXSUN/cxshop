import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxshop/framework/http";
import { CatalogDataSourceService } from "./catalog-data-source.service.js";
import { catalogDataSourceModules } from "./catalog-data-source.types.js";

const provider = z.enum(["own", "frappe"]);
const moduleKey = z.enum(catalogDataSourceModules);
const settings = z.object({
  appKeyConfigured: z.boolean(),
  appSecretConfigured: z.boolean(),
  connectionName: z.string(),
  frappeConfigured: z.boolean(),
  frappeEnabled: z.boolean(),
  frappeUrl: z.string().nullable(),
  lastVerifiedAt: z.string().nullable(),
  modules: z.array(
    z.object({
      description: z.string(),
      label: z.string(),
      module: moduleKey,
      provider,
      updatedAt: z.string().nullable(),
      updatedBy: z.string().nullable()
    })
  ),
  saveToEnvironment: z.boolean(),
  verificationStatus: z.enum(["live", "offline", "unverified"]),
  verifiedUser: z.string().nullable()
});
const connection = z.object({
  connected: z.boolean(),
  latencyMs: z.number().nonnegative(),
  message: z.string(),
  provider,
  providerLabel: z.string()
});
const syncResult = z.object({
  catalogs: z.number().int().nonnegative(),
  direction: z.enum(["frappe-to-own", "own-to-frappe"]),
  erpnextItems: z.number().int().nonnegative(),
  items: z.number().int().nonnegative(),
  sliders: z.number().int().nonnegative(),
  message: z.string()
});
const frappeItem = z.object({
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  disabled: z.number().optional(),
  image: z.string().nullable().optional(),
  is_stock_item: z.number().optional(),
  item_code: z.string(),
  item_group: z.string().nullable().optional(),
  item_name: z.string(),
  standard_rate: z.union([z.number(), z.string()]).nullable().optional(),
  stock_uom: z.string().nullable().optional()
});
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
    saveToEnvironment: z.literal(true)
  })
  .strict();

export async function registerCatalogDataSourceRoutes(
  app: FastifyInstance,
  service: CatalogDataSourceService,
  resolveActorEmail: (request: FastifyRequest) => string
) {
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/settings/data-source/frappe-items",
    schemas: {
      querystring: z.object({ search: z.string().max(120).default("") }),
      response: z.array(frappeItem)
    },
    handler: ({ query }) => service.frappeItems(query.search)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/settings/data-source/frappe-items/:itemCode",
    schemas: {
      params: z.object({ itemCode: z.string().min(1).max(191) }),
      response: frappeItem
    },
    handler: ({ params }) => service.frappeItem(params.itemCode)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/settings/data-source",
    schemas: { response: settings },
    handler: () => service.settings()
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/settings/data-source",
    schemas: { body: z.object({ module: moduleKey, provider }).strict(), response: settings },
    handler: ({ body, request }) =>
      service.switchProvider(body.module, body.provider, resolveActorEmail(request))
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/settings/data-source/test",
    schemas: { body: z.object({ provider }).strict(), response: connection },
    handler: ({ body }) => service.test(body.provider)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/settings/data-source/frappe/verify",
    schemas: { body: frappeVerification, response: connection },
    handler: ({ body }) =>
      service.verifyFrappeConnection({
        url: body.url,
        ...(body.apiKey ? { apiKey: body.apiKey } : {}),
        ...(body.apiSecret ? { apiSecret: body.apiSecret } : {})
      })
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/settings/data-source/frappe",
    schemas: { body: frappeSave, response: settings.omit({ modules: true }) },
    handler: ({ body, request }) =>
      service.saveFrappeConnection(
        {
          connectionName: body.connectionName,
          enabled: body.enabled,
          saveToEnvironment: true,
          url: body.url,
          ...(body.apiKey ? { apiKey: body.apiKey } : {}),
          ...(body.apiSecret ? { apiSecret: body.apiSecret } : {})
        },
        resolveActorEmail(request)
      )
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/settings/data-source/sync/pull",
    schemas: { response: syncResult },
    handler: () => service.pullFromFrappe()
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/settings/data-source/sync/push",
    schemas: { response: syncResult },
    handler: () => service.pushToFrappe()
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/settings/data-source/sync/seed-demo",
    schemas: { response: syncResult },
    handler: () => service.seedDemoInFrappe()
  });
}
