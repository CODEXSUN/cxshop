import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxshop/framework/http";
import { CloudPublishingService } from "./cloud-publishing.service.js";
import type { CloudPublishingQueuePort } from "./cloud-publishing.types.js";

const base = "/blogs/cloud-publishing";
const connectionBase = "/application/site-connection";
const connectionInput = z
  .object({
    enabled: z.boolean(),
    password: z.string().max(2000).optional(),
    siteUrl: z.url(),
    user: z.string().trim().max(191)
  })
  .strict();
const connection = z.object({
  enabled: z.boolean(),
  lastVerifiedAt: z.string().nullable(),
  passwordConfigured: z.boolean(),
  siteUrl: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
  user: z.string(),
  verificationStatus: z.enum(["live", "unverified"]),
  verifiedUser: z.string().nullable(),
  transactionTokenConfigured: z.boolean()
});
const publication = z.object({
  articleId: z.number(),
  articleSlug: z.string(),
  articleTitle: z.string(),
  attempts: z.number(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  errorMessage: z.string().nullable(),
  id: z.number(),
  publicUrl: z.string().nullable(),
  remoteDocumentName: z.string().nullable(),
  requestedBy: z.string(),
  sourceUpdatedAt: z.string(),
  status: z.enum(["completed", "failed", "pending", "running"]),
  updatedAt: z.string(),
  uuid: z.string().length(8)
});
export async function registerCloudPublishingRoutes(
  app: FastifyInstance,
  enqueue: CloudPublishingQueuePort,
  actor: (request: FastifyRequest) => string
) {
  const service = new CloudPublishingService(enqueue);
  registerContractRoute(app, {
    method: "GET",
    url: connectionBase,
    schemas: { response: connection },
    handler: () => service.connection()
  });
  registerContractRoute(app, {
    method: "POST",
    url: `${base}/pull`,
    schemas: {
      response: z.object({
        created: z.number(),
        pulledAt: z.string(),
        received: z.number(),
        updated: z.number()
      })
    },
    handler: () => service.pull()
  });
  registerContractRoute(app, {
    method: "PUT",
    url: connectionBase,
    schemas: { body: connectionInput, response: connection },
    handler: ({ body, request }) => service.saveConnection(body, actor(request))
  });
  registerContractRoute(app, {
    method: "POST",
    url: `${connectionBase}/verify`,
    schemas: { response: connection },
    handler: () => service.verify()
  });
  registerContractRoute(app, {
    method: "GET",
    url: `${base}/publications`,
    schemas: { response: z.array(publication) },
    handler: () => service.publications()
  });
  registerContractRoute(app, {
    method: "POST",
    url: `${base}/articles/:articleId/publish`,
    schemas: {
      params: z.object({ articleId: z.coerce.number().int().positive() }),
      response: publication
    },
    handler: ({ params, request }) =>
      service.requestPublish(params.articleId, actor(request), request.id)
  });
}
