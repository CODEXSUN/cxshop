import { getPlatformDatabase } from "../../database/platform-database.js";
import type { ApplicationSetupRecord } from "./application-setup.types.js";

export class ApplicationSetupRepository {
  async get(): Promise<ApplicationSetupRecord> {
    const row = await getPlatformDatabase()
      .selectFrom("application_settings")
      .selectAll()
      .where("singleton_key", "=", 1)
      .executeTakeFirst();
    if (!row) throw new Error("Application setup is not initialized.");
    return {
      applicationCode: row.application_code,
      applicationName: row.application_name,
      databaseName: row.database_name,
      defaultLandingApp: row.default_landing_app as ApplicationSetupRecord["defaultLandingApp"],
      enabledModuleKeys: parseModuleKeys(row.enabled_module_keys),
      id: Number(row.id),
      status: row.status === "inactive" ? "inactive" : "active",
      uuid: row.uuid
    };
  }
}

function parseModuleKeys(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  try {
    const parsed = JSON.parse(String(value)) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
