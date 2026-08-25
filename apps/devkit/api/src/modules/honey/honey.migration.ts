import { sql, type Kysely } from "kysely";
import type { DevkitDatabase } from "../../database/schema.js";

export const honeyMigration = {
  description: "Actor-scoped Honey conversations, messages, and durable agent runs.",
  key: "devkit.honey.sql.v1"
} as const;

export const honeyMascotSettingsMigration = {
  description: "Global Piko placement and movement settings.",
  key: "devkit.honey.mascot-settings.sql.v1"
} as const;
export const honeyMascotSettingsStandardizationMigration = {
  description: "Standardize the global Piko settings record.",
  key: "devkit.honey.mascot-settings.sql.v2"
} as const;
export const honeyAuditStandardizationMigration = {
  description: "Standardize Honey public identifiers and lifecycle audit columns.",
  key: "devkit.honey.audit.sql.v1"
} as const;

export async function migrateHoneyModule(database: Kysely<DevkitDatabase>) {
  await sql`CREATE TABLE IF NOT EXISTS devkit_honey_threads (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL, created_by VARCHAR(160) NOT NULL DEFAULT 'system:honey',
    actor_id VARCHAR(160) NOT NULL, title VARCHAR(240) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_devkit_honey_threads_uuid (uuid),
    KEY idx_devkit_honey_threads_actor (actor_id, updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.execute(database);
  await sql`CREATE TABLE IF NOT EXISTS devkit_honey_messages (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL, created_by VARCHAR(160) NOT NULL DEFAULT 'system:honey',
    thread_uuid CHAR(8) NOT NULL, actor_id VARCHAR(160) NOT NULL,
    role VARCHAR(16) NOT NULL, body MEDIUMTEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_devkit_honey_messages_uuid (uuid),
    KEY idx_devkit_honey_messages_thread (thread_uuid, created_at),
    KEY idx_devkit_honey_messages_actor (actor_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.execute(database);
  await sql`CREATE TABLE IF NOT EXISTS devkit_honey_runs (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL, created_by VARCHAR(160) NOT NULL DEFAULT 'system:honey',
    thread_uuid CHAR(8) NOT NULL, actor_id VARCHAR(160) NOT NULL,
    mode VARCHAR(32) NOT NULL, provider VARCHAR(32) NOT NULL, model VARCHAR(191) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'pending', input_text MEDIUMTEXT NOT NULL,
    steps_json MEDIUMTEXT NOT NULL, result_text MEDIUMTEXT NULL, error_text TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_devkit_honey_runs_uuid (uuid),
    KEY idx_devkit_honey_runs_actor (actor_id, status, updated_at),
    KEY idx_devkit_honey_runs_thread (thread_uuid, updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.execute(database);
  return honeyMigration;
}

export async function migrateHoneyMascotSettings(database: Kysely<DevkitDatabase>) {
  await sql`CREATE TABLE IF NOT EXISTS devkit_honey_mascot_settings (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(8) NOT NULL,
    x_ratio DECIMAL(7,6) NOT NULL,
    y_ratio DECIMAL(7,6) NOT NULL,
    behavior VARCHAR(16) NOT NULL DEFAULT 'roam',
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_by VARCHAR(160) NOT NULL,
    updated_by VARCHAR(160) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.execute(database);
  await sql`INSERT INTO devkit_honey_mascot_settings
    (id, uuid, x_ratio, y_ratio, behavior, status, created_by, updated_by)
    VALUES (1, 'piko0001', 1, 1, 'roam', 'active', 'system', 'system')
    ON DUPLICATE KEY UPDATE id = id`.execute(database);
  return honeyMascotSettingsMigration;
}

export async function standardizeHoneyMascotSettings(database: Kysely<DevkitDatabase>) {
  await sql`ALTER TABLE devkit_honey_mascot_settings
    MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT,
    ADD COLUMN IF NOT EXISTS uuid CHAR(8) NOT NULL DEFAULT 'piko0001' AFTER id,
    ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'active' AFTER behavior,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(160) NOT NULL DEFAULT 'system' AFTER status,
    ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER updated_by`.execute(
    database
  );
  return honeyMascotSettingsStandardizationMigration;
}

export async function standardizeHoneyAudit(database: Kysely<DevkitDatabase>) {
  for (const table of ["devkit_honey_threads", "devkit_honey_runs"]) {
    await sql
      .raw(
        `ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS created_by VARCHAR(160) NOT NULL DEFAULT 'system:honey' AFTER uuid`
      )
      .execute(database);
  }
  await sql
    .raw(
      `ALTER TABLE devkit_honey_messages
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(160) NOT NULL DEFAULT 'system:honey' AFTER uuid,
    ADD COLUMN IF NOT EXISTS status VARCHAR(24) NOT NULL DEFAULT 'active' AFTER body,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`
    )
    .execute(database);
  return honeyAuditStandardizationMigration;
}
