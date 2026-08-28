import { resolve } from "node:path";
import type { FastifyRequest } from "fastify";
import { applicationAccessContext } from "./auth/application-access-context.js";
import { env } from "./env.js";
import { workspaceRoot } from "./modules/storage-manager/index.js";

configureFileManagerEnvironment();

const fileManagerApi = await import("@codexsun/file-manager/api");
const fileManagerContracts = await import("@codexsun/file-manager/contracts");

export const closeFileManagerDatabase = fileManagerApi.closeFileManagerDatabase;
export const fileManagerApiModuleKeys = fileManagerApi.fileManagerApiModuleKeys;
export const fileManagerPluginManifest = fileManagerContracts.fileManagerPluginManifest;
export const registerFileManagerApi = fileManagerApi.registerFileManagerApi;

export function resolveFileManagerContext(request: FastifyRequest) {
  if (isPublicFileContentRequest(request)) {
    return {
      actorId: "public:file-content",
      host: "cxshop",
      tenantId: env.DB_MASTER_NAME
    };
  }
  const context = applicationAccessContext(request);
  return {
    actorId: context.actorEmail,
    host: "cxshop",
    tenantId: context.databaseName
  };
}

function isPublicFileContentRequest(request: FastifyRequest) {
  return (
    request.method === "GET" && request.routeOptions.url === "/file-manager/files/:uuid/content"
  );
}

function configureFileManagerEnvironment() {
  setDefault("FILE_MANAGER_DB_HOST", env.DB_HOST);
  setDefault("FILE_MANAGER_DB_NAME", env.DB_MASTER_NAME);
  setDefault("FILE_MANAGER_DB_PASSWORD", env.DB_PASSWORD);
  setDefault("FILE_MANAGER_DB_PORT", String(env.DB_PORT));
  setDefault("FILE_MANAGER_DB_USER", env.DB_USER);
  setDefault("FILE_MANAGER_ENCRYPTION_KEY", env.JWT_SECRET);
  const configuredLocalRoot = process.env.FILE_MANAGER_LOCAL_ROOT?.trim() || "storage";
  process.env.FILE_MANAGER_LOCAL_ROOT = resolve(workspaceRoot(), configuredLocalRoot);
  setDefault("FILE_MANAGER_MAX_UPLOAD_BYTES", String(25 * 1024 * 1024));
}

function setDefault(key: string, value: string) {
  if (!process.env[key]?.trim()) process.env[key] = value;
}
