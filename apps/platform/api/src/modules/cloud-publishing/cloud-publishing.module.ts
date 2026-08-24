import { defineModule } from "@cxshop/framework/modules";
import { registerCloudPublishingRoutes } from "./cloud-publishing.routes.js";
import type { CloudPublishingQueuePort } from "./cloud-publishing.types.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
export function createCloudPublishingModule(
  enqueue: CloudPublishingQueuePort,
  actor: (request: FastifyRequest) => string
) {
  return defineModule({
    key: "blogs.cloud-publishing",
    label: "Cloud publishing",
    register: (app: FastifyInstance) => registerCloudPublishingRoutes(app, enqueue, actor)
  });
}
