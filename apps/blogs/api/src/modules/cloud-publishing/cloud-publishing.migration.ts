import { sql, type Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";

export const cloudPublishingMigration = {
  description: "Store encrypted production site settings and article publication runs.",
  key: "blogs.cloud-publishing"
} as const;
export const cloudPublishingSessionMigration = {
  description: "Add password-session authentication and bidirectional cloud pull settings.",
  key: "blogs.cloud-publishing.session"
} as const;

export async function migrateCloudPublishingModule(database: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_cloud_connections (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
    singleton_key VARCHAR(24) NOT NULL DEFAULT 'production' UNIQUE,
    site_url VARCHAR(500) NOT NULL, auth_mode VARCHAR(24) NOT NULL DEFAULT 'token',
    user_name VARCHAR(191) NOT NULL DEFAULT '', api_key_secret TEXT NULL,
    api_secret_secret TEXT NULL, password_secret TEXT NULL,
    session_token_secret TEXT NULL, pull_method VARCHAR(255) NOT NULL DEFAULT 'cxshop.api.pull_articles',
    publish_method VARCHAR(255) NOT NULL DEFAULT 'cxshop.api.publish_article',
    enabled TINYINT(1) NOT NULL DEFAULT 0, verification_status VARCHAR(24) NOT NULL DEFAULT 'unverified',
    verified_user VARCHAR(191) NULL, last_verified_at DATETIME NULL,
    updated_by VARCHAR(191) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS blogs_cloud_publications (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
    article_id INT NOT NULL, article_slug VARCHAR(191) NOT NULL, article_title VARCHAR(255) NOT NULL,
    source_updated_at DATETIME NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0, requested_by VARCHAR(191) NOT NULL,
    remote_document_name VARCHAR(191) NULL, public_url VARCHAR(1000) NULL, error_message TEXT NULL,
    completed_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX blogs_cloud_publications_article (article_id,created_at),
    INDEX blogs_cloud_publications_status (status,created_at),
    CONSTRAINT blogs_cloud_publications_article_fk FOREIGN KEY (article_id) REFERENCES blogs_articles(id)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
}

export async function migrateCloudPublishingSession(database: Kysely<BlogsDatabase>) {
  await sql
    .raw(
      "ALTER TABLE blogs_cloud_connections ADD COLUMN IF NOT EXISTS session_token_secret TEXT NULL"
    )
    .execute(database);
  await sql
    .raw(
      "ALTER TABLE blogs_cloud_connections ADD COLUMN IF NOT EXISTS pull_method VARCHAR(255) NOT NULL DEFAULT 'cxshop.api.pull_articles'"
    )
    .execute(database);
  await sql
    .raw(
      "UPDATE blogs_cloud_connections SET auth_mode='password', api_key_secret=NULL, api_secret_secret=NULL"
    )
    .execute(database);
}
