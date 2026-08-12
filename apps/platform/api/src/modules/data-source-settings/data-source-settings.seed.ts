import { createHash } from "node:crypto";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../../database/schema.js";
import { env } from "../../env.js";
import { encryptConnectionSecret } from "./data-source-settings.secrets.js";

export async function seedDataSourceSettingsModule(db: Kysely<PlatformDatabase>) {
  const environment = environmentConnection();
  const fingerprint = environmentFingerprint(environment);
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
        env_provider: environment.provider,
        provider: environment.provider,
        frappe_api_key_secret: environment.apiKey
          ? encryptConnectionSecret(environment.apiKey)
          : null,
        frappe_api_secret_secret: environment.apiSecret
          ? encryptConnectionSecret(environment.apiSecret)
          : null,
        frappe_enabled: environment.provider === "frappe",
        frappe_url: environment.url || null,
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
        env_provider: environment.provider,
        provider: environment.provider,
        frappe_api_key_secret: environment.apiKey
          ? encryptConnectionSecret(environment.apiKey)
          : null,
        frappe_api_secret_secret: environment.apiSecret
          ? encryptConnectionSecret(environment.apiSecret)
          : null,
        frappe_enabled: environment.provider === "frappe",
        frappe_url: environment.url || null,
        last_checked_at: null,
        last_verified_at: null,
        verification_status: "unverified",
        verified_user: null,
        updated_at: new Date(),
        updated_by: "environment-change"
      })
      .where("singleton_key", "=", 1)
      .execute();
  }
  return { provider: environment.provider, seeded: 1 } as const;
}

function environmentConnection() {
  return {
    apiKey: env.CXSHOP_FRAPPE_API_KEY.trim(),
    apiSecret: env.CXSHOP_FRAPPE_API_SECRET.trim(),
    provider: env.CXSHOP_DATA_SOURCE,
    url: env.CXSHOP_FRAPPE_URL.trim().replace(/\/$/u, "")
  };
}

function environmentFingerprint(value: ReturnType<typeof environmentConnection>) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
