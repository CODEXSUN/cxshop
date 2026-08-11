import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";
export const engagementMigration = {
  key: "blogs.engagement",
  description: "Article likes, stars, and share analytics."
} as const;
export async function migrateEngagementModule(db: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_engagement (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,uuid CHAR(8) NOT NULL UNIQUE,article_id INT NOT NULL,kind VARCHAR(24) NOT NULL,actor_key VARCHAR(191) NOT NULL,rating TINYINT NULL,channel VARCHAR(80) NOT NULL DEFAULT '',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY blogs_engagement_actor(article_id,kind,actor_key),INDEX blogs_engagement_summary(article_id,kind),CONSTRAINT blogs_engagement_article_fk FOREIGN KEY(article_id) REFERENCES blogs_articles(id) ON DELETE CASCADE) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(db);
}
