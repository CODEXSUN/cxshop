import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "./blogs-database.js";

export const blogsExperienceMigration = {
  key: "blogs.experience-v2",
  description: "Article authors and threaded discussion replies."
} as const;

export async function migrateBlogsExperience(database: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `ALTER TABLE blogs_articles
        ADD COLUMN IF NOT EXISTS author_name VARCHAR(191) NOT NULL DEFAULT 'CXShop Editorial Team' AFTER image_alt,
        ADD COLUMN IF NOT EXISTS author_role VARCHAR(191) NOT NULL DEFAULT 'Technology Editor' AFTER author_name,
        ADD COLUMN IF NOT EXISTS author_avatar VARCHAR(1000) NOT NULL DEFAULT '' AFTER author_role`
    )
    .execute(database);
  await sql
    .raw(
      `ALTER TABLE blogs_discussions
        ADD COLUMN IF NOT EXISTS parent_id INT NULL AFTER article_id,
        ADD INDEX IF NOT EXISTS blogs_discussions_parent (parent_id)`
    )
    .execute(database);
}
