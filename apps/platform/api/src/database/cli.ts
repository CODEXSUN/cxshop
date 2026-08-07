import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Database, type DatabaseConnection, type PortalCode } from "@cxshop/framework";
import argon2 from "argon2";
import { sql } from "kysely";
import { loadConfig } from "../config";

const command = process.argv[2];
const config = loadConfig();
const database = new Database(config.databaseUrl);

try {
  if (command === "migrate") await migrate(database.connection);
  else if (command === "seed") await seed(database.connection);
  else throw new Error("Use migrate or seed");
} finally {
  await database.destroy();
}

async function migrate(connection: DatabaseConnection): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS cxshop_schema_migrations (migration_key VARCHAR(100) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3))`.execute(connection);
  const directory = fileURLToPath(new URL("./migrations", import.meta.url));
  const files = (await readdir(directory)).filter(file => file.endsWith(".sql")).sort();
  for (const file of files) {
    const migrationKey = file.replace(/\.sql$/u, "");
    const applied = await connection.selectFrom("cxshop_schema_migrations").select("migration_key").where("migration_key", "=", migrationKey).executeTakeFirst();
    if (applied) continue;
    const source = await readFile(new URL(`./migrations/${file}`, import.meta.url), "utf8");
    for (const statement of source.split(";").map(value => value.trim()).filter(Boolean)) await sql.raw(statement).execute(connection);
    await connection.insertInto("cxshop_schema_migrations").values({ migration_key: migrationKey }).execute();
  }
}

async function seed(connection: DatabaseConnection): Promise<void> {
  const password = process.env.DEV_LOGIN_PASSWORD;
  if (!password || password.length < 12) throw new Error("DEV_LOGIN_PASSWORD must contain at least 12 characters");
  const passwordHash = await argon2.hash(password);
  const identities: ReadonlyArray<{ email: string; name: string; portal: PortalCode; permissions: string[] }> = [
    { email: config.DEV_LOGIN_SA_EMAIL, name: "System Super Admin", portal: "sa", permissions: ["platform.project.read", "platform.project.write", "platform.business-assist.use"] },
    { email: config.DEV_LOGIN_ADMIN_EMAIL, name: "Marketplace Admin", portal: "admin", permissions: ["platform.project.read", "platform.business-assist.use"] },
    { email: config.DEV_LOGIN_VENDOR_EMAIL, name: "Demo Vendor", portal: "vendor", permissions: ["vendor.dashboard.read"] },
    { email: config.DEV_LOGIN_STORE_EMAIL, name: "Demo Customer", portal: "store", permissions: ["store.account.read"] }
  ];
  for (const identity of identities) await seedIdentity(connection, identity, passwordHash);
  await seedVendorMembership(connection);
  await connection.insertInto("cxshop_projects").values({ public_id: randomUUID(), project_key: "FOUNDATION", name: "CXShop Foundation", status: "active" }).onDuplicateKeyUpdate({ name: "CXShop Foundation" }).execute();
}

async function seedIdentity(connection: DatabaseConnection, identity: { email: string; name: string; portal: PortalCode; permissions: string[] }, passwordHash: string): Promise<void> {
  await connection.insertInto("cxshop_users").values({ public_id: randomUUID(), email: identity.email, display_name: identity.name, password_hash: passwordHash }).onDuplicateKeyUpdate({ display_name: identity.name }).execute();
  const user = await connection.selectFrom("cxshop_users").select("id").where("email", "=", identity.email).executeTakeFirstOrThrow();
  await connection.insertInto("cxshop_portal_access").values({ user_id: user.id, portal: identity.portal, permissions: JSON.stringify(identity.permissions), active: true }).onDuplicateKeyUpdate({ permissions: JSON.stringify(identity.permissions), active: true }).execute();
}

async function seedVendorMembership(connection: DatabaseConnection): Promise<void> {
  await connection.insertInto("cxshop_vendors").values({ public_id: randomUUID(), vendor_key: "demo-vendor", name: "Demo Vendor", status: "active" }).onDuplicateKeyUpdate({ name: "Demo Vendor", status: "active" }).execute();
  const user = await connection.selectFrom("cxshop_users").select("id").where("email", "=", config.DEV_LOGIN_VENDOR_EMAIL).executeTakeFirstOrThrow();
  const vendor = await connection.selectFrom("cxshop_vendors").select(["id", "public_id"]).where("vendor_key", "=", "demo-vendor").executeTakeFirstOrThrow();
  await connection.insertInto("cxshop_vendor_memberships").values({ user_id: user.id, vendor_id: vendor.id, vendor_public_id: vendor.public_id, active: true }).onDuplicateKeyUpdate({ vendor_public_id: vendor.public_id, active: true }).execute();
}
