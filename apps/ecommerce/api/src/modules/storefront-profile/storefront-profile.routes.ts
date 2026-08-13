import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxshop/framework/http";
import { StorefrontProfileService } from "./storefront-profile.service.js";

const profileSchema = z.object({
  aboutUs: z.string().max(2000),
  copyrightText: z.string().max(240),
  instagramUrl: z.union([z.literal(""), z.string().url().max(500)]),
  linkedinUrl: z.union([z.literal(""), z.string().url().max(500)]),
  poweredByText: z.string().max(240),
  tagline: z.string().max(240),
  xUrl: z.union([z.literal(""), z.string().url().max(500)])
});

export async function registerStorefrontProfilePublicRoutes(app: FastifyInstance) {
  const service = new StorefrontProfileService();
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/profile",
    schemas: { response: profileSchema },
    handler: () => service.get()
  });
}

export async function registerStorefrontProfileRoutes(
  app: FastifyInstance,
  resolveActorEmail: (request: FastifyRequest) => string
) {
  const service = new StorefrontProfileService();
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/storefront/profile",
    schemas: { response: profileSchema },
    handler: () => service.get()
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/storefront/profile",
    schemas: { body: profileSchema, response: profileSchema },
    handler: ({ body, request }) => service.save(body, resolveActorEmail(request))
  });
}
