import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { DatabaseConnection, PortalCode } from "@cxshop/framework";
import argon2 from "argon2";
import { sql } from "kysely";
import mysql from "mysql2/promise";
import type { loadConfig } from "../config";
import { DatabaseProvider } from "../infrastructure/database";

type Config = ReturnType<typeof loadConfig>;

export async function bootstrapDatabase(config: Config): Promise<void> {
  console.info(`[database.preflight] ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
  await ensureDatabase(config);
  const database = new DatabaseProvider(config.databaseUrl);
  try {
    await migrateDatabase(database.connection);
    if (config.NODE_ENV !== "production") await seedDatabase(database.connection, config);
  } finally {
    await database.database.destroy();
  }
  console.info(`[database.ready] ${config.DB_NAME}`);
}

export async function migrateDatabase(connection: DatabaseConnection): Promise<void> {
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
    console.info(`[database.migration] applied ${migrationKey}`);
  }
}

export async function seedDatabase(connection: DatabaseConnection, config: Config): Promise<void> {
  const password = process.env.DEV_LOGIN_PASSWORD;
  if (!password || password.length < 12) throw new Error("DEV_LOGIN_PASSWORD must contain at least 12 characters");
  const passwordHash = await argon2.hash(password);
  const identities: ReadonlyArray<{ email: string; name: string; portal: PortalCode; permissions: string[] }> = [
    { email: config.DEV_LOGIN_SA_EMAIL, name: "System Super Admin", portal: "sa", permissions: ["platform.project.read", "platform.project.write", "platform.business-assist.use", "platform.catalog.read"] },
    { email: config.DEV_LOGIN_ADMIN_EMAIL, name: "Marketplace Admin", portal: "admin", permissions: ["platform.project.read", "platform.business-assist.use", "platform.catalog.read", "platform.catalog.write", "platform.order.read", "platform.order.write"] },
    { email: config.DEV_LOGIN_VENDOR_EMAIL, name: "Demo Vendor", portal: "vendor", permissions: ["vendor.dashboard.read"] },
    { email: config.DEV_LOGIN_STORE_EMAIL, name: "Demo Customer", portal: "store", permissions: ["store.account.read"] }
  ];
  for (const identity of identities) await seedIdentity(connection, identity, passwordHash);
  await seedVendorMembership(connection, config);
  await seedCatalog(connection);
  await connection.insertInto("cxshop_projects").values({ public_id: randomUUID(), project_key: "FOUNDATION", name: "CXShop Foundation", status: "active" }).onDuplicateKeyUpdate({ name: "CXShop Foundation" }).execute();
  console.info("[database.seed] development foundation ready");
}

async function ensureDatabase(config: Config): Promise<void> {
  if (!/^[a-zA-Z0-9_]+$/u.test(config.DB_NAME)) throw new Error("DB_NAME contains unsupported characters");
  const connection = await mysql.createConnection({ host: config.DB_HOST, port: config.DB_PORT, user: config.DB_USER, password: config.DB_PASSWORD });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await connection.end();
  }
}

async function seedIdentity(connection: DatabaseConnection, identity: { email: string; name: string; portal: PortalCode; permissions: string[] }, passwordHash: string): Promise<void> {
  await connection.insertInto("cxshop_users").values({ public_id: randomUUID(), email: identity.email, display_name: identity.name, password_hash: passwordHash }).onDuplicateKeyUpdate({ display_name: identity.name }).execute();
  const user = await connection.selectFrom("cxshop_users").select("id").where("email", "=", identity.email).executeTakeFirstOrThrow();
  await connection.insertInto("cxshop_portal_access").values({ user_id: user.id, portal: identity.portal, permissions: JSON.stringify(identity.permissions), active: true }).onDuplicateKeyUpdate({ permissions: JSON.stringify(identity.permissions), active: true }).execute();
}

async function seedVendorMembership(connection: DatabaseConnection, config: Config): Promise<void> {
  await connection.insertInto("cxshop_vendors").values({ public_id: randomUUID(), vendor_key: "demo-vendor", name: "Demo Vendor", status: "active" }).onDuplicateKeyUpdate({ name: "Demo Vendor", status: "active" }).execute();
  const user = await connection.selectFrom("cxshop_users").select("id").where("email", "=", config.DEV_LOGIN_VENDOR_EMAIL).executeTakeFirstOrThrow();
  const vendor = await connection.selectFrom("cxshop_vendors").select(["id", "public_id"]).where("vendor_key", "=", "demo-vendor").executeTakeFirstOrThrow();
  await connection.insertInto("cxshop_vendor_memberships").values({ user_id: user.id, vendor_id: vendor.id, vendor_public_id: vendor.public_id, active: true }).onDuplicateKeyUpdate({ vendor_public_id: vendor.public_id, active: true }).execute();
}

async function seedCatalog(connection: DatabaseConnection): Promise<void> {
  await connection.insertInto("cxshop_catalogs").values({ public_id: randomUUID(), catalog_key: "MAIN", name: "CXShop Computer Store", slug: "computers", description: "Computers, components, displays, networking, and accessories for home and business.", status: "active" }).onDuplicateKeyUpdate({ name: "CXShop Computer Store", slug: "computers", description: "Computers, components, displays, networking, and accessories for home and business." }).execute();
  const catalog = await connection.selectFrom("cxshop_catalogs").select("id").where("catalog_key", "=", "MAIN").executeTakeFirstOrThrow();
  const categories = [
    { name: "Laptops", slug: "laptops", description: "Portable systems for work, study, creation, and gaming.", sort_order: 10 },
    { name: "Desktops", slug: "desktops", description: "Ready-built towers and compact business computers.", sort_order: 20 },
    { name: "Monitors", slug: "monitors", description: "Displays for office work, design, gaming, and production.", sort_order: 30 },
    { name: "Components", slug: "components", description: "Processors, graphics cards, motherboards, memory, and cooling.", sort_order: 40 },
    { name: "Storage", slug: "storage", description: "NVMe drives, SATA SSDs, hard drives, and portable storage.", sort_order: 50 },
    { name: "Networking", slug: "networking", description: "Wi-Fi routers, switches, adapters, and structured connectivity.", sort_order: 60 },
    { name: "Accessories", slug: "accessories", description: "Keyboards, mice, webcams, headsets, docks, and cables.", sort_order: 70 },
    { name: "Spares", slug: "spares", description: "Chargers, batteries, fans, screens, and replacement parts.", sort_order: 80 }
  ];
  for (const category of categories) await connection.insertInto("cxshop_categories").values({ public_id: randomUUID(), catalog_id: catalog.id, parent_id: null, status: "active", ...category }).onDuplicateKeyUpdate({ name: category.name, description: category.description, status: "active", sort_order: category.sort_order }).execute();
  const products = [
    { key: "LAP-PRO-14", name: "Vertex Pro 14 Laptop", slug: "vertex-pro-14-laptop", category: "laptops", summary: "A light 14-inch productivity laptop with 16 GB memory and fast NVMe storage.", description: "Vertex Pro 14 is a balanced portable computer for office work, development, study, and everyday creative tasks. The test configuration includes a high-resolution display, 16 GB memory, and a 1 TB NVMe drive.", sku: "VTX-P14-16-1T", variant: "16 GB / 1 TB", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=82" },
    { key: "LAP-GAME-16", name: "Forge 16 Gaming Laptop", slug: "forge-16-gaming-laptop", category: "laptops", summary: "A 16-inch performance notebook designed for gaming, rendering, and engineering tools.", description: "Forge 16 combines a high-refresh display, dedicated graphics, strong cooling, and upgradeable memory. It represents a full-size gaming and mobile workstation test product.", sku: "FRG-16-32-1T", variant: "32 GB / 1 TB", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=82" },
    { key: "PC-CREATOR-X", name: "Creator X Workstation", slug: "creator-x-workstation", category: "desktops", summary: "A quiet desktop workstation for editing, CAD, software builds, and local AI workloads.", description: "Creator X is a full tower workstation test configuration with high-core-count processing, dedicated graphics, 64 GB memory, and separate system and project drives.", sku: "CRX-64-2T", variant: "64 GB / 2 TB", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1200&q=82" },
    { key: "PC-MINI-BIZ", name: "Core Mini Business PC", slug: "core-mini-business-pc", category: "desktops", summary: "A compact desktop for counters, classrooms, offices, and digital signage.", description: "Core Mini mounts behind a display or sits quietly on a desk. Dual-display support, wired networking, Wi-Fi, and serviceable storage make it useful for business deployments.", sku: "CMB-16-512", variant: "16 GB / 512 GB", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=82" },
    { key: "MON-4K-27", name: "Canvas 27 4K Monitor", slug: "canvas-27-4k-monitor", category: "monitors", summary: "A sharp 27-inch 4K display with USB-C connectivity for productive desks.", description: "Canvas 27 provides a detailed 4K workspace, an adjustable stand, multiple inputs, and one-cable USB-C connectivity for compatible laptops.", sku: "CVS-27-4K", variant: "27-inch 4K", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=82" },
    { key: "MON-GAME-32", name: "Vector 32 Gaming Monitor", slug: "vector-32-gaming-monitor", category: "monitors", summary: "A 32-inch high-refresh display for fluid gaming and simulation.", description: "Vector 32 combines a fast panel, adaptive refresh support, low input delay, and flexible DisplayPort and HDMI connectivity.", sku: "VEC-32-165", variant: "32-inch 165 Hz", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=82" },
    { key: "CPU-12C-PRO", name: "Apex 12-Core Processor", slug: "apex-12-core-processor", category: "components", summary: "A 12-core desktop processor for mixed creative, development, and gaming builds.", description: "Apex is a component test product with a modern desktop socket, multithreaded performance, and support for current memory and connectivity standards.", sku: "APX-12C", variant: "12 cores", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=82" },
    { key: "GPU-16G-X", name: "Nova X 16 GB Graphics Card", slug: "nova-x-16gb-graphics-card", category: "components", summary: "A triple-fan graphics card for high-resolution gaming and GPU-accelerated work.", description: "Nova X represents a dedicated graphics product with 16 GB video memory, multiple display outputs, and a large cooling assembly for sustained workloads.", sku: "NVX-16G", variant: "16 GB", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=82" },
    { key: "SSD-NVME-2T", name: "Pulse NVMe 2 TB SSD", slug: "pulse-nvme-2tb-ssd", category: "storage", summary: "A fast 2 TB M.2 drive for operating systems, applications, and project files.", description: "Pulse NVMe is a compact solid-state storage test product for current desktops and laptops. It includes a five-year limited warranty profile for offer testing.", sku: "PLS-N2-2T", variant: "2 TB", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=82" },
    { key: "ROUTER-WIFI6", name: "Orbit Wi-Fi 6 Router", slug: "orbit-wifi-6-router", category: "networking", summary: "A dual-band router for fast home offices, apartments, and small shops.", description: "Orbit provides Wi-Fi 6, gigabit Ethernet, guest access, and simple mesh expansion for a complete networking test category.", sku: "ORB-AX3000", variant: "AX3000", image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=1200&q=82" },
    { key: "KEY-MECH-TKL", name: "Tactile TKL Keyboard", slug: "tactile-tkl-keyboard", category: "accessories", summary: "A compact mechanical keyboard with tactile switches and replaceable USB-C cable.", description: "Tactile TKL keeps the navigation keys while removing the number pad. It supports replaceable switches, adjustable lighting, and wired USB-C operation.", sku: "TAC-TKL-BLK", variant: "Tactile black", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=82" },
    { key: "MOUSE-PRO-WL", name: "Arc Pro Wireless Mouse", slug: "arc-pro-wireless-mouse", category: "accessories", summary: "A precise wireless mouse with quiet controls and multi-device switching.", description: "Arc Pro is shaped for long work sessions and can move between three paired devices. USB receiver and Bluetooth modes support mixed desktop setups.", sku: "ARC-PRO-GR", variant: "Graphite", image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=82" },
    { key: "SPARE-USB-C-65", name: "65 W USB-C Laptop Charger", slug: "65w-usb-c-laptop-charger", category: "spares", summary: "A compact replacement USB-C power adapter with a detachable cable.", description: "This universal test spare supports common USB Power Delivery profiles up to 65 watts. Device compatibility must be confirmed by each seller offer.", sku: "PWR-USBC-65", variant: "65 W", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=82" },
    { key: "SPARE-LAP-BAT", name: "Notebook Replacement Battery", slug: "notebook-replacement-battery", category: "spares", summary: "A replacement battery test product for compatible 14-inch business notebooks.", description: "This catalog record demonstrates model-specific spare parts. Seller offers must declare exact compatible models, capacity, warranty, and safety certifications.", sku: "BAT-14-BIZ", variant: "54 Wh", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=82" }
  ];
  for (const product of products) await seedProduct(connection, product);
  await connection.updateTable("cxshop_products").set({ status: "archived" }).where("product_key", "in", ["DESK-LAMP-01", "FIELD-BAG-01", "NOTEBOOK-01"]).execute();
  await connection.updateTable("cxshop_categories").set({ status: "archived" }).where("slug", "in", ["workspace", "carry", "everyday"]).execute();
}

async function seedProduct(connection: DatabaseConnection, item: { key: string; name: string; slug: string; category: string; summary: string; description: string; sku: string; variant: string; image: string }): Promise<void> {
  await connection.insertInto("cxshop_products").values({ public_id: randomUUID(), product_key: item.key, name: item.name, slug: item.slug, summary: item.summary, description: item.description, status: "active" }).onDuplicateKeyUpdate({ name: item.name, summary: item.summary, description: item.description, status: "active" }).execute();
  const product = await connection.selectFrom("cxshop_products").select(["id", "public_id"]).where("product_key", "=", item.key).executeTakeFirstOrThrow();
  const category = await connection.selectFrom("cxshop_categories").select("id").where("slug", "=", item.category).executeTakeFirstOrThrow();
  await connection.insertInto("cxshop_product_categories").values({ product_id: product.id, category_id: category.id, is_primary: true }).onDuplicateKeyUpdate({ is_primary: true }).execute();
  await connection.insertInto("cxshop_product_variants").values({ public_id: randomUUID(), product_id: product.id, sku: item.sku, name: item.variant, attributes: JSON.stringify({ finish: item.variant }), status: "active" }).onDuplicateKeyUpdate({ name: item.variant, status: "active" }).execute();
  const media = await connection.selectFrom("cxshop_product_media").select("id").where("product_id", "=", product.id).orderBy("sort_order").executeTakeFirst();
  if (media) await connection.updateTable("cxshop_product_media").set({ media_url: item.image, alt_text: item.name }).where("id", "=", media.id).execute();
  else await connection.insertInto("cxshop_product_media").values({ public_id: randomUUID(), product_id: product.id, media_url: item.image, alt_text: item.name, sort_order: 0 }).execute();
}
