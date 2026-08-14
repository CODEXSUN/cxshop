import { AppError } from "@cxshop/framework/errors";
import { env } from "../../env.js";
import { PlatformActivityService } from "../platform-activity/index.js";
import { dataSourceConnection, storedCredentials } from "./data-source-settings.connection.js";
import { updateDataSourceEnvironment } from "./data-source-settings.env-store.js";
import { encryptConnectionSecret } from "./data-source-settings.secrets.js";
import { DataSourceSettingsRepository } from "./data-source-settings.repository.js";
import type {
  DataSourceProvider,
  FrappeConnectionPayload,
  FrappeVerificationPayload
} from "./data-source-settings.types.js";

export class DataSourceSettingsService {
  constructor(
    private readonly repository = new DataSourceSettingsRepository(),
    private readonly activity = new PlatformActivityService()
  ) {}

  async settings() {
    return this.toSettings(await this.repository.get());
  }

  async switchProvider(provider: DataSourceProvider, actorEmail: string) {
    const record = await this.repository.get();
    if (provider === "frappe" && !this.configured(record))
      throw AppError.validation(
        "Configure the Frappe URL and API credentials before enabling Frappe Live."
      );
    const updated = await this.repository.setProvider(provider, actorEmail);
    await this.activity.recordActivity({
      action: "platform.data-source.provider-changed",
      actorEmail,
      details: { provider },
      moduleKey: "platform.data-source-settings",
      recordLabel: provider
    });
    return this.toSettings(updated);
  }

  async test(provider: DataSourceProvider) {
    const record = await this.repository.get();
    return dataSourceConnection(
      provider,
      provider === "frappe" ? storedCredentials(record) : undefined
    ).test();
  }

  async frappeCredentials() {
    return storedCredentials(await this.repository.get());
  }

  async verifyFrappe(input: FrappeVerificationPayload) {
    const record = await this.repository.get();
    const saved = storedCredentials(record);
    const credentials = {
      apiKey: input.apiKey?.trim() || saved.apiKey,
      apiSecret: input.apiSecret?.trim() || saved.apiSecret,
      url: normalizeUrl(input.url || saved.url)
    };
    const result = await dataSourceConnection("frappe", credentials).test();
    if (
      credentials.url === saved.url &&
      credentials.apiKey === saved.apiKey &&
      credentials.apiSecret === saved.apiSecret
    ) {
      await this.repository.recordVerification(result.connected, authenticatedUser(result.message));
    }
    return result;
  }

  async saveFrappe(input: FrappeConnectionPayload, actorEmail: string) {
    const normalized = {
      ...input,
      connectionName: input.connectionName.trim(),
      url: normalizeUrl(input.url)
    };
    if (input.saveToEnvironment) {
      const current = storedCredentials(await this.repository.get());
      await updateDataSourceEnvironment({
        CXSHOP_DATA_SOURCE: input.enabled ? "frappe" : env.CXSHOP_DATA_SOURCE,
        CXSHOP_FRAPPE_URL: normalized.url,
        CXSHOP_FRAPPE_API_KEY: input.apiKey?.trim() || current.apiKey,
        CXSHOP_FRAPPE_API_SECRET: input.apiSecret?.trim() || current.apiSecret
      });
    }
    const record = await this.repository.saveConnection(
      {
        ...normalized,
        ...(input.apiKey?.trim()
          ? { apiKeySecret: encryptConnectionSecret(input.apiKey.trim()) }
          : {}),
        ...(input.apiSecret?.trim()
          ? { apiSecretSecret: encryptConnectionSecret(input.apiSecret.trim()) }
          : {})
      },
      actorEmail
    );
    await this.activity.recordActivity({
      action: "platform.data-source.frappe-saved",
      actorEmail,
      details: { enabled: input.enabled, saveToEnvironment: input.saveToEnvironment },
      moduleKey: "platform.data-source-settings",
      recordLabel: normalized.connectionName
    });
    return this.toSettings(record);
  }

  private toSettings(record: Awaited<ReturnType<DataSourceSettingsRepository["get"]>>) {
    return {
      availableProviders: ["own", "frappe"] as DataSourceProvider[],
      envProvider: record.env_provider,
      appKeyConfigured: Boolean(record.frappe_api_key_secret || env.CXSHOP_FRAPPE_API_KEY.trim()),
      appSecretConfigured: Boolean(
        record.frappe_api_secret_secret || env.CXSHOP_FRAPPE_API_SECRET.trim()
      ),
      connectionName: record.connection_name,
      frappeConfigured: this.configured(record),
      frappeEnabled: Boolean(record.frappe_enabled),
      frappeUrl: record.frappe_url?.trim() || env.CXSHOP_FRAPPE_URL.trim() || null,
      lastCheckedAt: record.last_checked_at ? new Date(record.last_checked_at).toISOString() : null,
      lastVerifiedAt: record.last_verified_at
        ? new Date(record.last_verified_at).toISOString()
        : null,
      provider: record.provider,
      providerLabel: record.provider === "frappe" ? "Frappe Live" : "Own Database",
      updatedAt: record.updated_at ? new Date(record.updated_at).toISOString() : null,
      updatedBy: record.updated_by,
      saveToEnvironment: Boolean(record.save_to_environment),
      verificationStatus: record.verification_status,
      verifiedUser: record.verified_user
    };
  }

  private configured(record: Awaited<ReturnType<DataSourceSettingsRepository["get"]>>) {
    const value = storedCredentials(record);
    return Boolean(value.url && value.apiKey && value.apiSecret);
  }
}

function normalizeUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw AppError.validation("Frappe URL must be a valid HTTP or HTTPS URL.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw AppError.validation(
      "Frappe URL must use HTTP or HTTPS without credentials, query, or fragment."
    );
  return url.toString().replace(/\/$/u, "");
}

function authenticatedUser(message: string) {
  const match = /^Connected as (.+)\.$/u.exec(message);
  return match?.[1] ?? null;
}
