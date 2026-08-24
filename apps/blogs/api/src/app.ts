import type { FastifyInstance } from "fastify";
import { requireApplicationAccess } from "@cxshop/framework/api";
import { bootstrapBlogsDatabase } from "./database/blogs-database.js";
import { blogsEnv } from "./env.js";
import { articleModule } from "./modules/article/index.js";
import { discussionModule } from "./modules/discussion/index.js";
import { engagementModule } from "./modules/engagement/index.js";
import { taxonomyModule } from "./modules/taxonomy/index.js";
import {
  createCloudPublishingModule,
  CloudPublishingService,
  cloudArticlePublishJobName,
  type CloudPublishingQueuePort
} from "./modules/cloud-publishing/index.js";
import type { FastifyRequest } from "fastify";

export const blogsApiModuleKeys = [
  taxonomyModule.key,
  articleModule.key,
  discussionModule.key,
  engagementModule.key,
  "blogs.cloud-publishing"
];
export async function registerBlogsApi(
  app: FastifyInstance,
  dependencies: {
    enqueue: CloudPublishingQueuePort;
    registerJobHandler: (
      name: string,
      handler: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
    ) => void;
    resolveActorEmail: (request: FastifyRequest) => string;
  }
) {
  await bootstrapBlogsDatabase();
  const cloudPublishingModule = createCloudPublishingModule(
    dependencies.enqueue,
    dependencies.resolveActorEmail
  );
  dependencies.registerJobHandler(cloudArticlePublishJobName, async (payload) => {
    const result = await new CloudPublishingService(dependencies.enqueue).process(
      Number(payload.publicationId)
    );
    return result
      ? { publicationId: result.id, publicUrl: result.publicUrl, status: result.status }
      : { publicationId: Number(payload.publicationId), status: "missing" };
  });
  await app.register(async (blogsApp) => {
    blogsApp.addHook("preHandler", async (request) => {
      if (request.url.startsWith("/public/blog") || request.url.startsWith("/sitemap.xml")) return;
      requireApplicationAccess({
        applicationDatabase: blogsEnv.DB_MASTER_NAME,
        authorization: request.headers.authorization,
        secret: blogsEnv.JWT_SECRET
      });
    });
    await articleModule.register(blogsApp);
    await discussionModule.register(blogsApp);
    await engagementModule.register(blogsApp);
    await taxonomyModule.register(blogsApp);
    await cloudPublishingModule.register(blogsApp);
  });
}
