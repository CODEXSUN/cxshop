import type { FastifyInstance } from "fastify";
import { requireApplicationAccess } from "@cxshop/framework/api";
import { bootstrapBlogsDatabase } from "./database/blogs-database.js";
import { blogsEnv } from "./env.js";
import { articleModule } from "./modules/article/index.js";
import { discussionModule } from "./modules/discussion/index.js";
import { engagementModule } from "./modules/engagement/index.js";
import { taxonomyModule } from "./modules/taxonomy/index.js";

export const blogsApiModuleKeys = [
  taxonomyModule.key,
  articleModule.key,
  discussionModule.key,
  engagementModule.key
];
export async function registerBlogsApi(app: FastifyInstance) {
  await bootstrapBlogsDatabase();
  await app.register(async (blogsApp) => {
    blogsApp.addHook("preHandler", (request) => {
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
  });
}
