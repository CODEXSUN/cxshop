import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";
export const taxonomyMigration = {
  key: "blogs.taxonomy",
  description: "Blog categories and tags."
} as const;
export async function migrateTaxonomyModule(database: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_taxonomy (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
    kind VARCHAR(24) NOT NULL, name VARCHAR(191) NOT NULL, slug VARCHAR(191) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '', status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY blogs_taxonomy_kind_slug (kind, slug), INDEX blogs_taxonomy_search (kind,status,name)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
}
