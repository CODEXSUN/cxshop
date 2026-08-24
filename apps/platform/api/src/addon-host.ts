import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Kysely } from "kysely";
import {
  blogsApiModuleKeys,
  provisionBlogsDatabase,
  registerBlogsApi,
  type BlogRequestContext,
  type BlogsDatabase
} from "@codexsun/blog/api";
import { blogPluginManifest } from "@codexsun/blog/contracts";
import {
  bootstrapBlogCloudDatabase as bootstrapCloudPublishingDatabase,
  closeBlogCloudDatabase as closeCloudPublishingDatabase,
  CloudPublishingService,
  cloudArticlePublishJobName,
  createCloudPublishingModule,
  type CloudPublishingQueuePort
} from "./modules/cloud-publishing/index.js";
import { requireApplicationAccess } from "@cxshop/framework/api";
import { AddonHostRegistry, type AddonManifest } from "@cxshop/framework/addons";
import { runMigrationBatch } from "@cxshop/framework/db";
import { applicationAccessContext } from "./auth/application-access-context.js";
import { getPlatformDatabase } from "./database/platform-database.js";
import { env } from "./env.js";

type BlogDependencies = {
  enqueue: CloudPublishingQueuePort;
  registerJobHandler: (
    name: string,
    handler: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
  ) => void;
  resolveActorEmail: (request: FastifyRequest) => string;
};

const cloudPublishingModuleKey = "blogs.cloud-publishing";
const registry = new AddonHostRegistry({
  capabilities: [
    "identity",
    "authorization",
    "database",
    "migration-ledger",
    "audit",
    "queue",
    "media.public"
  ],
  runtimeMode: "single-client"
});

export const addonApiModuleKeys = [...blogsApiModuleKeys, cloudPublishingModuleKey] as const;

export async function registerBlogAddon(app: FastifyInstance, dependencies: BlogDependencies) {
  try {
    await registry.register({
      activate: async () => {
        await provisionBlogDatabase();
        await registerBlogsApi(app, {
          authorize: ({ permission, request }) =>
            applicationAccessContext(request).authorize(permission),
          resolveContext: resolveBlogContext
        });
        await registerCloudPublishing(app, dependencies);
      },
      close: closeCloudPublishingDatabase,
      databaseMode: "host-database",
      manifest: blogManifest,
      moduleKeys: addonApiModuleKeys
    });
  } catch (error) {
    await closeAfterActivationFailure(error);
  }
}

export function activePlatformAddons() {
  return registry.list().map(({ databaseMode, manifest, moduleKeys }) => ({
    databaseMode,
    displayName: manifest.displayName,
    key: manifest.key,
    moduleKeys,
    version: manifest.version
  }));
}

export async function closePlatformAddons() {
  await registry.close();
}

async function provisionBlogDatabase() {
  await provisionBlogsDatabase({
    context: blogContext(null, "https://cxshop.local"),
    runMigrationBatch: (database, batch) => runMigrationBatch(database, batch)
  });
}

function resolveBlogContext(request: FastifyRequest) {
  const authority = request.headers.host ?? "localhost";
  const origin = request.headers.origin ?? `${request.protocol}://${authority}`;
  return blogContext(request.authContext?.payload.email ?? null, origin);
}

function blogContext(actorId: string | null, origin: string): BlogRequestContext {
  return {
    actorId,
    database: getPlatformDatabase() as unknown as Kysely<BlogsDatabase>,
    host: "cxshop",
    origin,
    scopeId: env.DB_MASTER_NAME
  };
}

async function registerCloudPublishing(app: FastifyInstance, dependencies: BlogDependencies) {
  await bootstrapCloudPublishingDatabase();
  const module = createCloudPublishingModule(dependencies.enqueue, dependencies.resolveActorEmail);
  dependencies.registerJobHandler(cloudArticlePublishJobName, async (payload) => {
    const publicationId = Number(payload.publicationId);
    const result = await new CloudPublishingService(dependencies.enqueue).process(publicationId);
    return result
      ? { publicationId: result.id, publicUrl: result.publicUrl, status: result.status }
      : { publicationId, status: "missing" };
  });
  await app.register(async (cloudApp) => {
    cloudApp.addHook("preHandler", (request) => {
      requireApplicationAccess({
        applicationDatabase: env.DB_MASTER_NAME,
        authorization: request.headers.authorization,
        secret: env.JWT_SECRET
      });
    });
    await module.register(cloudApp);
  });
}

async function closeAfterActivationFailure(activationError: unknown): Promise<never> {
  try {
    await registry.close();
  } catch (closeError) {
    throw new AggregateError(
      [activationError, closeError],
      "Add-on activation failed and cleanup was incomplete.",
      { cause: closeError }
    );
  }
  throw activationError;
}

const blogManifest: AddonManifest = {
  ...blogPluginManifest,
  packages: { ...blogPluginManifest.packages }
};
