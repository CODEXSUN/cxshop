import { createHash } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase } from "../../database/schema.js";
import { env } from "../../env.js";
import { defaultTenantModuleKeys } from "../app-registry/app-registry.service.js";
import { createTenantDatabase, getTenantDatabaseByName } from "../../database/tenant-database.js";
import { migrateTenantRuntimeModule } from "../tenant/tenant.migration.js";
import { seedTenantPermissionModule } from "../tenant-permission/index.js";
import { seedTenantRolePermissionModule } from "../tenant-role-permission/index.js";
import { seedTenantRoleModule } from "../tenant-role/index.js";
import { seedTenantUserRoleModule } from "../tenant-user-role/index.js";
import { seedTenantUserModule } from "../tenant-user/index.js";
import { bootstrapCoreDatabase } from "@cxshop/core-api";
import { bootstrapBillingDatabase } from "@cxshop/billing-api";
import { bootstrapEcommerceDatabase } from "@cxshop/ecommerce-api";
import { migrateMailModule, seedMailModule } from "@cxshop/mail-api";

export async function seedApplicationSetupModule(database: Kysely<PlatformDatabase>) {
  const enabledModuleKeys = Array.from(
    new Set(["platform.application", ...defaultTenantModuleKeys])
  ).filter((key) => key !== "devkit");
  const applicationCode = "CXSHOP";
  await sql`
    INSERT INTO application_settings (
      uuid, singleton_key, application_code, application_name, database_name,
      default_landing_app, enabled_module_keys, status
    ) VALUES (
      ${stableUuid(applicationCode)}, 1, ${applicationCode}, ${env.DEFAULT_TENANT_NAME},
      ${env.DB_MASTER_NAME}, 'application', ${JSON.stringify(enabledModuleKeys)}, 'active'
    )
    ON DUPLICATE KEY UPDATE
      database_name = VALUES(database_name),
      enabled_module_keys = VALUES(enabled_module_keys),
      updated_at = CURRENT_TIMESTAMP
  `.execute(database);
  await bootstrapStandaloneApplicationDatabase(enabledModuleKeys);
  return { seeded: 1 } as const;
}

async function bootstrapStandaloneApplicationDatabase(enabledModuleKeys: string[]) {
  await createTenantDatabase(env.DB_MASTER_NAME);
  const database = getTenantDatabaseByName(env.DB_MASTER_NAME);
  await migrateTenantRuntimeModule(database);
  for (const moduleKey of enabledModuleKeys) {
    await database
      .insertInto("app_module_settings")
      .values({
        enabled: true,
        module_key: moduleKey,
        settings_json: JSON.stringify({ runtime: "standalone" }),
        status: "active",
        uuid: stableUuid(moduleKey).slice(0, 8)
      })
      .onDuplicateKeyUpdate({ enabled: true, status: "active", updated_at: sql`CURRENT_TIMESTAMP` })
      .execute();
  }
  await seedTenantRoleModule(database);
  await seedTenantPermissionModule(database);
  await seedTenantUserModule(database);
  await seedTenantUserRoleModule(database);
  await seedTenantRolePermissionModule(database);
  await bootstrapCoreDatabase(env.DB_MASTER_NAME);
  await bootstrapBillingDatabase(env.DB_MASTER_NAME);
  await bootstrapEcommerceDatabase(env.DB_MASTER_NAME);
  await migrateMailModule(database as unknown as Kysely<Record<string, Record<string, unknown>>>);
  await seedMailModule(database as never);
}

function stableUuid(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
