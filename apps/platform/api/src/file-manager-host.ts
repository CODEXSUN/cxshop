import { resolve } from "node:path";
import { env } from "./env.js";

configureFileManagerEnvironment();

const fileManager = await import("@codexsun/file-manager/api");

export const closeFileManagerDatabase = fileManager.closeFileManagerDatabase;
export const fileManagerApiModuleKeys = fileManager.fileManagerApiModuleKeys;
export const registerFileManagerApi = fileManager.registerFileManagerApi;

function configureFileManagerEnvironment() {
  setDefault("FILE_MANAGER_DB_HOST", env.DB_HOST);
  setDefault("FILE_MANAGER_DB_NAME", env.DB_MASTER_NAME);
  setDefault("FILE_MANAGER_DB_PASSWORD", env.DB_PASSWORD);
  setDefault("FILE_MANAGER_DB_PORT", String(env.DB_PORT));
  setDefault("FILE_MANAGER_DB_USER", env.DB_USER);
  setDefault("FILE_MANAGER_ENCRYPTION_KEY", env.JWT_SECRET);
  setDefault("FILE_MANAGER_LOCAL_ROOT", resolve("storage", "file-manager"));
  setDefault("FILE_MANAGER_MAX_UPLOAD_BYTES", String(25 * 1024 * 1024));
}

function setDefault(key: string, value: string) {
  if (!process.env[key]?.trim()) process.env[key] = value;
}
