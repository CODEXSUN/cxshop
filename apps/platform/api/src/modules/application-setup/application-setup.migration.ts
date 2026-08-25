import { sql, type Kysely } from "kysely";
import type { PlatformDatabase } from "../../database/schema.js";

export const applicationSetupMigration = {
  description: "Standalone application identity and enabled module settings.",
  key: "platform.application-setup"
} as const;
export const applicationSetupAuditMigration = {
  description: "Add application settings ownership audit metadata.",
  key: "platform.application-setup.audit-v1"
} as const;

export async function migrateApplicationSetupModule(database: Kysely<PlatformDatabase>) {
  await sql
    .raw(
      `
    CREATE TABLE IF NOT EXISTS application_settings (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      uuid CHAR(8) NOT NULL UNIQUE,
      created_by VARCHAR(191) NOT NULL DEFAULT 'system:migration',
      singleton_key TINYINT NOT NULL DEFAULT 1 UNIQUE,
      application_code VARCHAR(64) NOT NULL UNIQUE,
      application_name VARCHAR(180) NOT NULL,
      database_name VARCHAR(120) NOT NULL,
      default_landing_app VARCHAR(64) NOT NULL DEFAULT 'application',
      enabled_module_keys JSON NOT NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `
    )
    .execute(database);
}

export async function standardizeApplicationSetupAudit(database: Kysely<PlatformDatabase>) {
  await sql
    .raw(
      `ALTER TABLE application_settings
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(191) NOT NULL DEFAULT 'system:migration' AFTER uuid`
    )
    .execute(database);
}
