import { sql, type Kysely } from "kysely";
import type { PlatformDatabase } from "../../database/schema.js";

export async function migrateDataSourceSettingsModule(db: Kysely<PlatformDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS data_source_settings (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(8) NOT NULL UNIQUE DEFAULT (LOWER(SUBSTRING(MD5(UUID()),1,8))),
    singleton_key TINYINT NOT NULL DEFAULT 1 UNIQUE,
    provider VARCHAR(24) NOT NULL,
    env_provider VARCHAR(24) NOT NULL,
    env_fingerprint VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_by VARCHAR(191) NOT NULL DEFAULT 'system:migration',
    updated_by VARCHAR(191) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    )
    .execute(db);
}

export async function migrateDataSourceConnectionModule(db: Kysely<PlatformDatabase>) {
  const columns = [
    "ADD COLUMN connection_name VARCHAR(160) NOT NULL DEFAULT 'Frappe' AFTER provider",
    "ADD COLUMN frappe_url VARCHAR(500) NULL AFTER connection_name",
    "ADD COLUMN frappe_api_key_secret TEXT NULL AFTER frappe_url",
    "ADD COLUMN frappe_api_secret_secret TEXT NULL AFTER frappe_api_key_secret",
    "ADD COLUMN frappe_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER frappe_api_secret_secret",
    "ADD COLUMN save_to_environment TINYINT(1) NOT NULL DEFAULT 0 AFTER frappe_enabled",
    "ADD COLUMN verification_status VARCHAR(24) NOT NULL DEFAULT 'unverified' AFTER save_to_environment",
    "ADD COLUMN verified_user VARCHAR(191) NULL AFTER verification_status",
    "ADD COLUMN last_checked_at DATETIME NULL AFTER verified_user",
    "ADD COLUMN last_verified_at DATETIME NULL AFTER last_checked_at"
  ];
  for (const definition of columns) {
    try {
      await sql.raw(`ALTER TABLE data_source_settings ${definition}`).execute(db);
    } catch (error) {
      if (!isDuplicateColumn(error)) throw error;
    }
  }
}

function isDuplicateColumn(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_FIELDNAME"
  );
}
