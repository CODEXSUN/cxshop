import { Kysely, MysqlDialect } from "kysely";
import { createPool, type PoolOptions } from "mysql2";
import { createConnection } from "mysql2/promise";
import { env } from "../env.js";
import type { Tenant } from "../modules/tenant/tenant.types.js";
import { assertDatabaseName, quoteIdentifier } from "./database-utils.js";
import type { TenantDatabase } from "./schema.js";

const tenantConnections = new Map<string, Kysely<TenantDatabase>>();

export async function createTenantDatabase(target: string | Tenant) {
  void target;
  const name = applicationDatabaseName();
  const host = env.DB_HOST;
  const port = env.DB_PORT;
  const user = env.DB_USER;
  console.info(`[database] ensuring application database "${name}" on ${host}:${port}`);
  const connection = await createConnection({
    host,
    password: env.DB_PASSWORD,
    port,
    user,
    timezone: "Z"
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(name)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.info(`[database] application database ready: "${name}"`);
  } finally {
    await connection.end();
  }
}

export function getTenantDatabase(tenant: Tenant) {
  void tenant;
  const key = applicationDatabaseName();
  const existing = tenantConnections.get(key);
  if (existing) {
    return existing;
  }

  const database = new Kysely<TenantDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        database: key,
        connectionLimit: 10,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        timezone: "Z",
        user: env.DB_USER
      } satisfies PoolOptions)
    })
  });

  tenantConnections.set(key, database);
  return database;
}

export function resolveTenantDatabasePassword(tenant: Tenant) {
  const secretRef = tenant.dbSecretRef.trim();
  if (secretRef === "DB_PASSWORD") return env.DB_PASSWORD;
  const secret = process.env[secretRef];
  if (!secret) throw new Error(`Tenant database secret "${secretRef}" is not configured.`);
  return secret;
}

export function getTenantDatabaseByName(databaseName: string) {
  if (databaseName !== applicationDatabaseName()) {
    throw new Error("Database selection is disabled in single-database mode.");
  }
  const name = applicationDatabaseName();
  const existing = tenantConnections.get(name);
  if (existing) return existing;
  const database = new Kysely<TenantDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        database: name,
        connectionLimit: 10,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        timezone: "Z",
        user: env.DB_USER
      } satisfies PoolOptions)
    })
  });
  tenantConnections.set(name, database);
  return database;
}

export async function closeTenantDatabase(tenant: Tenant) {
  void tenant;
  const key = applicationDatabaseName();
  const existing = tenantConnections.get(key);
  if (!existing) {
    return;
  }

  tenantConnections.delete(key);
  await existing.destroy();
}

export async function closeAllTenantDatabases() {
  const openConnections = Array.from(tenantConnections.values());
  tenantConnections.clear();
  await Promise.all(openConnections.map(async (database) => database.destroy()));
}

export async function dropTenantDatabase(tenant: Tenant) {
  void tenant;
  throw new Error("Per-tenant database deletion is disabled in single-database mode.");
}

function applicationDatabaseName() {
  return assertDatabaseName(env.DB_MASTER_NAME, "application database name");
}
