import type { FastifyInstance } from "fastify";
import { AddonHostRegistry, type AddonManifest } from "@cxshop/framework/addons";
import { blogsApiModuleKeys, closeBlogsDatabase, registerBlogsApi } from "@cxshop/blogs-api";

type BlogDependencies = Parameters<typeof registerBlogsApi>[1];

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

export const addonApiModuleKeys = [...blogsApiModuleKeys] as const;

export async function registerBlogAddon(app: FastifyInstance, dependencies: BlogDependencies) {
  try {
    await registry.register({
      activate: () => registerBlogsApi(app, dependencies),
      close: closeBlogsDatabase,
      databaseMode: "dedicated",
      manifest: blogManifest,
      moduleKeys: blogsApiModuleKeys
    });
  } catch (error) {
    await closeAfterActivationFailure(error);
  }
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

const blogManifest: AddonManifest = {
  capabilities: {
    optional: ["media.public", "queue"],
    required: ["identity", "authorization", "database", "migration-ledger"]
  },
  compatibleHosts: "host-adapter",
  databaseModes: ["dedicated", "host-database"],
  displayName: "Blog",
  hostApi: "^1.0.0",
  key: "codexsun.blog",
  kind: "composable-addon-application",
  packages: {
    api: "@cxshop/blogs-api",
    contracts: "@codexsun/blog/contracts",
    web: "@cxshop/blogs-web"
  },
  runtimeModes: ["multi-tenant", "single-client"],
  schemaVersion: 1,
  version: "1.0.65"
};
