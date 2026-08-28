import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError } from "@cxshop/framework/errors";
import { registerContractRoute } from "@cxshop/framework/http";
import { ApplicationSetupService } from "./application-setup.service.js";

const appId = z.enum([
  "application",
  "billing",
  "blogs",
  "devkit",
  "ecommerce",
  "file-manager",
  "mail",
  "task-manager"
]);
const response = z.object({
  application: z.object({
    applicationCode: z.string(),
    applicationName: z.string(),
    databaseName: z.string(),
    defaultLandingApp: appId,
    enabledModuleKeys: z.array(z.string()),
    id: z.number(),
    status: z.enum(["active", "inactive"]),
    uuid: z.string()
  }),
  apps: z.array(
    z.object({
      alwaysEnabled: z.boolean(),
      defaultLanding: z.boolean(),
      description: z.string(),
      enabled: z.boolean(),
      id: appId,
      label: z.string(),
      moduleKey: z.string(),
      stack: z.string()
    })
  ),
  defaultLandingApp: appId
});
const publicBrandingResponse = z.object({
  brandName: z.string(),
  logoDarkUrl: z.string().nullable(),
  logoUrl: z.string().nullable(),
  primaryPhone: z.string().nullable()
});

export async function registerApplicationSetupRoutes(app: FastifyInstance) {
  const service = new ApplicationSetupService();
  registerContractRoute(app, {
    handler: () => service.publicBranding(),
    method: "GET",
    schemas: { response: publicBrandingResponse },
    url: "/public/company-branding"
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/application/setup",
    schemas: { response },
    handler: ({ request }) => {
      if (!request.authContext) {
        throw AppError.unauthorized("Sign in to access application setup.");
      }
      return service.runtime();
    }
  });
}
