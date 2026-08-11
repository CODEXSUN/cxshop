import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";
export const articleMigration = {
  key: "blogs.article",
  description: "MDX posts, pages, images, and taxonomy links."
} as const;
export async function migrateArticleModule(database: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_articles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE, kind VARCHAR(24) NOT NULL,
    title VARCHAR(255) NOT NULL, slug VARCHAR(191) NOT NULL UNIQUE, excerpt VARCHAR(500) NOT NULL DEFAULT '',
    mdx LONGTEXT NOT NULL, featured_image VARCHAR(1000) NOT NULL DEFAULT '', image_alt VARCHAR(255) NOT NULL DEFAULT '',
    category_id INT NULL, tag_ids JSON NOT NULL, seo_title VARCHAR(191) NOT NULL DEFAULT '',
    seo_description VARCHAR(320) NOT NULL DEFAULT '', canonical_url VARCHAR(1000) NOT NULL DEFAULT '',
    status VARCHAR(24) NOT NULL DEFAULT 'draft', published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT KEY blogs_articles_search (title,excerpt,mdx), INDEX blogs_articles_public (kind,status,published_at),
    CONSTRAINT blogs_articles_category_fk FOREIGN KEY(category_id) REFERENCES blogs_taxonomy(id) ON DELETE SET NULL
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
}
