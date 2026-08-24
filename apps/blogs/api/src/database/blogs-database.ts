import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { runMigrationBatch, type MigrationBatch } from "@cxshop/framework/db";
import { blogsEnv } from "../env.js";
import { articleMigration, migrateArticleModule } from "../modules/article/article.migration.js";
import {
  discussionMigration,
  migrateDiscussionModule
} from "../modules/discussion/discussion.migration.js";
import {
  engagementMigration,
  migrateEngagementModule
} from "../modules/engagement/engagement.migration.js";
import {
  taxonomyMigration,
  migrateTaxonomyModule
} from "../modules/taxonomy/taxonomy.migration.js";
import { seedTaxonomyModule } from "../modules/taxonomy/taxonomy.seed.js";
import { seedArticleModule } from "../modules/article/article.seed.js";
import { blogsExperienceMigration, migrateBlogsExperience } from "./blogs-experience.migration.js";
import {
  cloudPublishingMigration,
  cloudPublishingSessionMigration,
  migrateCloudPublishingSession,
  migrateCloudPublishingModule
} from "../modules/cloud-publishing/index.js";

export type BlogsDatabase = Record<string, unknown>;
let database: Kysely<BlogsDatabase> | undefined;
let bootstrapped = false;

export const blogsMigrationBatch: MigrationBatch<BlogsDatabase> = {
  batch: 1,
  description: "Blogs MDX publishing schema.",
  scope: "blogs",
  version: "1.0.55",
  steps: [
    step(taxonomyMigration, migrateTaxonomyModule),
    step(articleMigration, migrateArticleModule),
    step(discussionMigration, migrateDiscussionModule),
    step(engagementMigration, migrateEngagementModule),
    {
      checksum: `${blogsExperienceMigration.key}:v1`,
      description: blogsExperienceMigration.description,
      name: blogsExperienceMigration.key,
      up: migrateBlogsExperience,
      version: 2
    },
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

export function getBlogsDatabase() {
  database ??= new Kysely<BlogsDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        database: blogsEnv.DB_MASTER_NAME,
        host: blogsEnv.DB_HOST,
        password: blogsEnv.DB_PASSWORD,
        port: blogsEnv.DB_PORT,
        user: blogsEnv.DB_USER,
        connectionLimit: 4,
        timezone: "Z"
      })
    })
  });
  return database;
}

export async function bootstrapBlogsDatabase() {
  if (bootstrapped) return;
  await migrateBlogsDatabase();
  await seedBlogsDatabase();
  bootstrapped = true;
}

export async function migrateBlogsDatabase() {
  await runMigrationBatch(getBlogsDatabase(), blogsMigrationBatch);
}

export async function seedBlogsDatabase() {
  await seedTaxonomyModule();
  await seedArticleModule();
}

export async function closeBlogsDatabase() {
  await database?.destroy();
  database = undefined;
  bootstrapped = false;
}

function step(
  migration: { description: string; key: string },
  up: (db: Kysely<BlogsDatabase>) => Promise<void>
) {
  return {
    checksum: `${migration.key}:v1`,
    description: migration.description,
    name: migration.key,
    up,
    version: 1
  };
}
