import type { Kysely } from "kysely";
import { runMigrationBatch, type MigrationBatch } from "@cxshop/framework/db";
import { getPlatformDatabase } from "../../database/platform-database.js";
import {
  cloudPublishingMigration,
  cloudPublishingSessionMigration,
  migrateCloudPublishingModule,
  migrateCloudPublishingSession
} from "./cloud-publishing.migration.js";

export type BlogCloudDatabase = Record<string, unknown>;

let bootstrapped = false;

const migrationBatch: MigrationBatch<BlogCloudDatabase> = {
  batch: 1,
  description: "CXShop Blog production connection and publication history.",
  scope: "blogs",
  version: "1.0.66",
  steps: [
    {
      checksum: `${cloudPublishingMigration.key}:v1`,
      description: cloudPublishingMigration.description,
      name: cloudPublishingMigration.key,
      up: migrateCloudPublishingModule,
      version: 3
    },
    {
      checksum: `${cloudPublishingSessionMigration.key}:v1`,
      description: cloudPublishingSessionMigration.description,
      name: cloudPublishingSessionMigration.key,
      up: migrateCloudPublishingSession,
      version: 4
    }
  ]
};

export function getBlogCloudDatabase() {
  return getPlatformDatabase() as unknown as Kysely<BlogCloudDatabase>;
}

export async function bootstrapBlogCloudDatabase() {
  if (bootstrapped) return;
  await migrateBlogCloudDatabase();
  bootstrapped = true;
}

export async function migrateBlogCloudDatabase() {
  await runMigrationBatch(getBlogCloudDatabase(), migrationBatch);
}

export async function seedBlogCloudDatabase() {
  return undefined;
}

export async function closeBlogCloudDatabase() {
  bootstrapped = false;
}
