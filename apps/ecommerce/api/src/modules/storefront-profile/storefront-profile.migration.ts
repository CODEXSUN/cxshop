import { sql, type Kysely } from "kysely";
import type { EcommerceDatabase } from "../../database/ecommerce-database.js";

export const storefrontProfileMigration = {
  description: "White-label storefront profile and footer settings.",
  key: "ecommerce.storefront.profile"
} as const;

export async function migrateStorefrontProfileModule(database: Kysely<EcommerceDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_storefront_profiles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(8) NOT NULL UNIQUE,
    profile_key VARCHAR(32) NOT NULL UNIQUE,
    tagline VARCHAR(240) NOT NULL DEFAULT '',
    about_us TEXT NOT NULL,
    copyright_text VARCHAR(240) NOT NULL DEFAULT '',
    powered_by_text VARCHAR(240) NOT NULL DEFAULT '',
    linkedin_url VARCHAR(500) NOT NULL DEFAULT '',
    instagram_url VARCHAR(500) NOT NULL DEFAULT '',
    x_url VARCHAR(500) NOT NULL DEFAULT '',
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_by VARCHAR(191) NOT NULL DEFAULT 'system:migration',
    updated_by VARCHAR(191) NOT NULL DEFAULT 'system:migration',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
    )
    .execute(database);
}
