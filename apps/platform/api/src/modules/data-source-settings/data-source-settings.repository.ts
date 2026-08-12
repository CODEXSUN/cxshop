import { getPlatformDatabase } from "../../database/platform-database.js";
import type { DataSourceProvider } from "./data-source-settings.types.js";
import type { FrappeConnectionPayload } from "./data-source-settings.types.js";

export class DataSourceSettingsRepository {
  async get() {
    return getPlatformDatabase()
      .selectFrom("data_source_settings")
      .selectAll()
      .where("singleton_key", "=", 1)
      .executeTakeFirstOrThrow();
  }

  async setProvider(provider: DataSourceProvider, actorEmail: string) {
    await getPlatformDatabase()
      .updateTable("data_source_settings")
      .set({
        provider,
        updated_at: new Date(),
        updated_by: actorEmail
      })
      .where("singleton_key", "=", 1)
      .execute();
    return this.get();
  }

  async saveConnection(
    input: FrappeConnectionPayload & { apiKeySecret?: string; apiSecretSecret?: string },
    actorEmail: string
  ) {
    await getPlatformDatabase()
      .updateTable("data_source_settings")
      .set({
        connection_name: input.connectionName,
        frappe_enabled: input.enabled,
        frappe_url: input.url,
        save_to_environment: input.saveToEnvironment,
        verification_status: "unverified",
        verified_user: null,
        last_checked_at: null,
        last_verified_at: null,
        ...(input.apiKeySecret ? { frappe_api_key_secret: input.apiKeySecret } : {}),
        ...(input.apiSecretSecret ? { frappe_api_secret_secret: input.apiSecretSecret } : {}),
        updated_at: new Date(),
        updated_by: actorEmail
      })
      .where("singleton_key", "=", 1)
      .execute();
    return this.get();
  }

  async recordVerification(connected: boolean, authenticatedUser: string | null) {
    const now = new Date();
    await getPlatformDatabase()
      .updateTable("data_source_settings")
      .set({
        last_checked_at: now,
        ...(connected ? { last_verified_at: now } : {}),
        verification_status: connected ? "live" : "offline",
        verified_user: authenticatedUser
      })
      .where("singleton_key", "=", 1)
      .execute();
  }
}
