import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";
export const discussionMigration = {
  key: "blogs.discussion",
  description: "Moderated article comments and reviews."
} as const;
export async function migrateDiscussionModule(db: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_discussions (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,uuid CHAR(8) NOT NULL UNIQUE,article_id INT NOT NULL,kind VARCHAR(24) NOT NULL,author_name VARCHAR(191) NOT NULL,author_email VARCHAR(320) NOT NULL,body TEXT NOT NULL,rating TINYINT NULL,status VARCHAR(24) NOT NULL DEFAULT 'pending',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,INDEX blogs_discussion_article(article_id,kind,status),CONSTRAINT blogs_discussion_article_fk FOREIGN KEY(article_id) REFERENCES blogs_articles(id) ON DELETE CASCADE) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(db);
}
