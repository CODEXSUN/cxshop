import { sql } from "kysely";
import { getPlatformDatabase } from "../../database/platform-database.js";
import { env } from "../../env.js";
import { decryptConnectionSecret } from "./data-source-settings.secrets.js";
import type {
  DataSourceConnectionResult,
  DataSourceProvider
} from "./data-source-settings.types.js";

export interface DataSourceConnection {
  test(): Promise<DataSourceConnectionResult>;
}

export function dataSourceConnection(
  provider: DataSourceProvider,
  credentials?: FrappeCredentials
): DataSourceConnection {
  return provider === "frappe"
    ? new FrappeConnection(credentials ?? environmentCredentials())
    : new OwnDatabaseConnection();
}

export type FrappeCredentials = { apiKey: string; apiSecret: string; url: string };

class OwnDatabaseConnection implements DataSourceConnection {
  async test() {
    const started = Date.now();
    await sql`SELECT 1 AS connected`.execute(getPlatformDatabase());
    return result("own", true, Date.now() - started, "MariaDB connection is ready.");
  }
}

class FrappeConnection implements DataSourceConnection {
  constructor(private readonly credentials: FrappeCredentials) {}
  async test() {
    const started = Date.now();
    if (!credentialsConfigured(this.credentials))
      return result("frappe", false, 0, "Frappe environment credentials are incomplete.");
    try {
      const response = await fetch(
        new URL("/api/method/frappe.auth.get_logged_user", this.credentials.url),
        {
          headers: {
            Authorization: `token ${this.credentials.apiKey}:${this.credentials.apiSecret}`,
            Accept: "application/json"
          },
          signal: AbortSignal.timeout(10_000)
        }
      );
      if (!response.ok)
        return result(
          "frappe",
          false,
          Date.now() - started,
          `Frappe returned HTTP ${response.status}.`
        );
      const body = (await response.json()) as { message?: string };
      return result(
        "frappe",
        Boolean(body.message),
        Date.now() - started,
        body.message
          ? `Connected as ${body.message}.`
          : "Frappe response did not include an authenticated user."
      );
    } catch (error) {
      return result(
        "frappe",
        false,
        Date.now() - started,
        error instanceof Error ? error.message : "Frappe connection failed."
      );
    }
  }
}

export function frappeConfigured() {
  return credentialsConfigured(environmentCredentials());
}

export function storedCredentials(record: {
  frappe_api_key_secret: string | null;
  frappe_api_secret_secret: string | null;
  frappe_url: string | null;
}): FrappeCredentials {
  return {
    apiKey: record.frappe_api_key_secret
      ? decryptConnectionSecret(record.frappe_api_key_secret)
      : env.CXSHOP_FRAPPE_API_KEY.trim(),
    apiSecret: record.frappe_api_secret_secret
      ? decryptConnectionSecret(record.frappe_api_secret_secret)
      : env.CXSHOP_FRAPPE_API_SECRET.trim(),
    url: record.frappe_url?.trim() || env.CXSHOP_FRAPPE_URL.trim()
  };
}

function environmentCredentials(): FrappeCredentials {
  return {
    apiKey: env.CXSHOP_FRAPPE_API_KEY.trim(),
    apiSecret: env.CXSHOP_FRAPPE_API_SECRET.trim(),
    url: env.CXSHOP_FRAPPE_URL.trim()
  };
}

function credentialsConfigured(value: FrappeCredentials) {
  return Boolean(value.url && value.apiKey && value.apiSecret);
}

function result(
  provider: DataSourceProvider,
  connected: boolean,
  latencyMs: number,
  message: string
): DataSourceConnectionResult {
  return {
    connected,
    latencyMs,
    message,
    provider,
    providerLabel: provider === "frappe" ? "Frappe Live" : "Own Database"
  };
}
