import { createHash } from "node:crypto";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../../database/schema.js";
import { env } from "../../env.js";
import { encryptConnectionSecret } from "./data-source-settings.secrets.js";

export async function seedDataSourceSettingsModule(db: Kysely<PlatformDatabase>) {
  const fingerprint = createHash("sha256").update(env.CXSHOP_DATA_SOURCE).digest("hex");
  const current = await db
    .selectFrom("data_source_settings")
    .selectAll()
    .where("singleton_key", "=", 1)
    .executeTakeFirst();
  if (!current) {
    await db
      .insertInto("data_source_settings")
      .values({
        connection_name: "Frappe",
        env_fingerprint: fingerprint,
        env_provider: env.CXSHOP_DATA_SOURCE,
        provider: env.CXSHOP_DATA_SOURCE,
        frappe_api_key_secret: env.CXSHOP_FRAPPE_API_KEY.trim()
          ? encryptConnectionSecret(env.CXSHOP_FRAPPE_API_KEY.trim())
          : null,
        frappe_api_secret_secret: env.CXSHOP_FRAPPE_API_SECRET.trim()
          ? encryptConnectionSecret(env.CXSHOP_FRAPPE_API_SECRET.trim())
          : null,
        frappe_enabled: env.CXSHOP_DATA_SOURCE === "frappe",
        frappe_url: env.CXSHOP_FRAPPE_URL.trim() || null,
        save_to_environment: false,
        verification_status: "unverified",
        verified_user: null,
        last_checked_at: null,
        last_verified_at: null,
        singleton_key: 1,
        updated_by: "environment-seed"
      })
      .execute();
  } else if (current.env_fingerprint !== fingerprint) {
    await db
      .updateTable("data_source_settings")
      .set({
        env_fingerprint: fingerprint,
        env_provider: env.CXSHOP_DATA_SOURCE,
        provider: env.CXSHOP_DATA_SOURCE,
        updated_at: new Date(),
        updated_by: "environment-change"
      })
      .where("singleton_key", "=", 1)
      .execute();
  }
  const connection = await db
    .selectFrom("data_source_settings")
    .selectAll()
    .where("singleton_key", "=", 1)
    .executeTakeFirstOrThrow();
  if (!connection.frappe_url && env.CXSHOP_FRAPPE_URL.trim()) {
    await db
      .updateTable("data_source_settings")
      .set({
        frappe_url: env.CXSHOP_FRAPPE_URL.trim(),
        ...(connection.frappe_api_key_secret || !env.CXSHOP_FRAPPE_API_KEY.trim()
          ? {}
          : { frappe_api_key_secret: encryptConnectionSecret(env.CXSHOP_FRAPPE_API_KEY.trim()) }),
        ...(connection.frappe_api_secret_secret || !env.CXSHOP_FRAPPE_API_SECRET.trim()
          ? {}
          : {
              frappe_api_secret_secret: encryptConnectionSecret(env.CXSHOP_FRAPPE_API_SECRET.trim())
            })
      })
      .where("singleton_key", "=", 1)
      .execute();
  }
  return { provider: env.CXSHOP_DATA_SOURCE, seeded: 1 } as const;
}
