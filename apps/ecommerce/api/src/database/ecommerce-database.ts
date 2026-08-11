import { Kysely, MysqlDialect } from "kysely";
import { createPool, type PoolOptions } from "mysql2";
import { createConnection } from "mysql2/promise";
import {
  rollbackMigrationBatch,
  runMigrationBatch,
  type MigrationBatch
} from "@cxshop/framework/db";
import { ecommerceEnv as env } from "../env.js";
import {
  migrateProductInformationModule,
  productInformationMigration
} from "../modules/product-information/product-information.migration.js";
import { seedProductInformationModule } from "../modules/product-information/product-information.seed.js";
import {
  migrateProductVariantModule,
  productVariantMigration
} from "../modules/product-variant/product-variant.migration.js";
import { seedProductVariantModule } from "../modules/product-variant/product-variant.seed.js";
import {
  migrateProductImageModule,
  productImageMigration
} from "../modules/product-image/product-image.migration.js";
import { seedProductImageModule } from "../modules/product-image/product-image.seed.js";
import {
  productInformationDetailsMigration,
  upgradeProductInformationDetails
} from "../modules/product-information/product-information.migration.js";
import {
  catalogMatchingMigration,
  catalogMatchingUuidWidthMigration,
  migrateCatalogMatchingModule,
  upgradeCatalogMatchingUuidWidth
} from "../modules/catalog-matching/catalog-matching.migration.js";
import { seedCatalogMatchingModule } from "../modules/catalog-matching/catalog-matching.seed.js";

export type EcommerceDatabase = Record<string, unknown>;
type ConnectionOptions = {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
};
type ConnectionEntry = { database: Kysely<EcommerceDatabase>; lastUsedAt: number };

const connections = new Map<string, ConnectionEntry>();
const migrated = new Set<string>();

export const ecommerceTenantMigrations = [
  productInformationMigration,
  productInformationDetailsMigration,
  productVariantMigration,
  productImageMigration,
  catalogMatchingMigration,
  catalogMatchingUuidWidthMigration
] as const;
export const ecommerceMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 1,
  description: "Ecommerce catalog schema baseline.",
  scope: "ecommerce",
  version: "1.0.55",
  steps: [
    {
      checksum: `${productInformationMigration.key}:v1`,
      description: productInformationMigration.description,
      name: productInformationMigration.key,
      up: migrateProductInformationModule,
      version: 1
    },
    {
      checksum: `${productInformationDetailsMigration.key}:v2`,
      description: productInformationDetailsMigration.description,
      name: productInformationDetailsMigration.key,
      up: upgradeProductInformationDetails,
      version: 2
    },
    {
      checksum: `${productVariantMigration.key}:v1`,
      description: productVariantMigration.description,
      name: productVariantMigration.key,
      up: migrateProductVariantModule,
      version: 1
    },
    {
      checksum: `${productImageMigration.key}:v1`,
      description: productImageMigration.description,
      name: productImageMigration.key,
      up: migrateProductImageModule,
      version: 1
    },
    {
      checksum: `${catalogMatchingMigration.key}:v1`,
      description: catalogMatchingMigration.description,
      name: catalogMatchingMigration.key,
      up: migrateCatalogMatchingModule,
      version: 1
    },
    {
      checksum: `${catalogMatchingUuidWidthMigration.key}:v2`,
      description: catalogMatchingUuidWidthMigration.description,
      name: catalogMatchingUuidWidthMigration.key,
      up: upgradeCatalogMatchingUuidWidth,
      version: 2
    }
  ]
};

export function resolveEcommerceDatabaseName(value: unknown) {
  void value;
  return env.DB_MASTER_NAME;
}

export function runWithEcommerceDatabase<T>(databaseName: string, callback: () => T) {
  void databaseName;
  return callback();
}

export function registerEcommerceTenantDatabaseConnection(input: ConnectionOptions) {
  void input;
}

export function getEcommerceDatabase(databaseName?: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  const existing = connections.get(name);
  if (existing) {
    existing.lastUsedAt = Date.now();
    return existing.database;
  }
  const database = new Kysely<EcommerceDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        database: name,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        user: env.DB_USER,
        connectionLimit: 4,
        idleTimeout: 60_000,
        maxIdle: 1,
        queueLimit: 100,
        timezone: "Z"
      } satisfies PoolOptions)
    })
  });
  connections.set(name, { database, lastUsedAt: Date.now() });
  return database;
}

export async function bootstrapEcommerceDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  if (migrated.has(name)) return;
  await ensureDatabase(name);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceMigrationBatch);
  await runWithEcommerceDatabase(name, seedProductInformationModule);
  await runWithEcommerceDatabase(name, seedProductVariantModule);
  await runWithEcommerceDatabase(name, seedProductImageModule);
  await runWithEcommerceDatabase(name, seedCatalogMatchingModule);
  migrated.add(name);
}

export async function migrateEcommerceTenantDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  await ensureDatabase(name);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceMigrationBatch);
}

export async function seedEcommerceTenantDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  await bootstrapEcommerceDatabase(name);
  await runWithEcommerceDatabase(name, seedProductInformationModule);
  await runWithEcommerceDatabase(name, seedProductVariantModule);
  await runWithEcommerceDatabase(name, seedProductImageModule);
  await runWithEcommerceDatabase(name, seedCatalogMatchingModule);
}

export async function rollbackEcommerceTenantDatabase(databaseName: string) {
  return rollbackMigrationBatch(getEcommerceDatabase(databaseName), ecommerceMigrationBatch);
}

export async function closeAllEcommerceDatabases() {
  const open = Array.from(connections.values(), ({ database }) => database);
  connections.clear();
  migrated.clear();
  await Promise.all(open.map((database) => database.destroy()));
}

async function ensureDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  const connection = await createConnection({
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
    user: env.DB_USER,
    timezone: "Z"
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}
