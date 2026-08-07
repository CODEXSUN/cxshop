import { readFileSync } from "node:fs";

export const requiredEnvironmentKeys = [
  "NODE_ENV",
  "RUNTIME_MODE",
  "MARKETPLACE_MODE",
  "INFRASTRUCTURE_MODE",
  "RUNTIME_LOCATION",
  "SHARED_DOCKER_NETWORK",
  "SHARED_CREDENTIALS_READY",
  "API_HOST",
  "API_PORT",
  "WEB_PORT",
  "API_URL",
  "API_BODY_MAX_BYTES",
  "RATE_LIMIT_MAX",
  "RATE_LIMIT_WINDOW",
  "GRAPHQL_QUERY_MAX_BYTES",
  "WEB_URL",
  "PUBLIC_URL",
  "DEV_LOGIN_AUTO",
  "DEV_LOGIN_STORE_EMAIL",
  "DEV_LOGIN_VENDOR_EMAIL",
  "DEV_LOGIN_ADMIN_EMAIL",
  "DEV_LOGIN_SA_EMAIL",
  "DEV_LOGIN_PASSWORD",
  "DB_DRIVER",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "REDIS_URL",
  "REDIS_PREFIX",
  "QUEUE_BACKEND",
  "STORAGE_DRIVER",
  "LOGIN_SECRET",
  "MEDIA_DRIVER",
  "FILEBROWSER_URL",
  "SHARED_MEDIA_VOLUME",
  "SHARED_MEDIA_ROOT"
];

export function readEnvironmentFile(file) {
  const values = {};
  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) throw new Error(`Invalid environment line: ${rawLine}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/u, "$2");
    values[key] = value;
  }
  return values;
}

export function validateEnvironment(values, options = {}) {
  const errors = [];
  for (const key of requiredEnvironmentKeys) {
    if (!values[key]) errors.push(`${key} is required.`);
  }

  validateEnum(values, "DB_DRIVER", ["mariadb"], errors);
  validateEnum(values, "QUEUE_BACKEND", ["database", "bullmq-redis"], errors);
  validateEnum(values, "STORAGE_DRIVER", ["local", "s3"], errors);
  validateEnum(values, "MARKETPLACE_MODE", ["single-operator", "multi-operator"], errors);
  validateEnum(values, "INFRASTRUCTURE_MODE", ["cxapp-shared", "dedicated"], errors);
  validateEnum(values, "RUNTIME_LOCATION", ["host", "container"], errors);
  validateEnum(values, "MEDIA_DRIVER", ["shared-filebrowser", "object-storage"], errors);
  validateEnum(values, "SHARED_CREDENTIALS_READY", ["0", "1"], errors);
  validateEnum(values, "DEV_LOGIN_AUTO", ["0", "1"], errors);
  validatePorts(values, errors);
  validateOrigins(values, errors);

  if (values.DB_NAME && !values.DB_NAME.startsWith("cxshop")) {
    errors.push("DB_NAME must use a cxshop-owned database name.");
  }
  if ((values.LOGIN_SECRET ?? "").length < 32) {
    errors.push("LOGIN_SECRET must contain at least 32 characters.");
  }
  validateIntegration(values, "CXAPP", errors);
  validateIntegration(values, "FRAPPE", errors);
  validateOpenAi(values, errors);
  validateSharedInfrastructure(values, errors);

  if (!options.allowExamples && Object.values(values).some(isPlaceholder)) {
    errors.push("The environment contains a placeholder value.");
  }
  if (values.NODE_ENV === "production") validateProduction(values, errors);
  return errors;
}

function validatePorts(values, errors) {
  const keys = [
    "API_PORT",
    "WEB_PORT",
    "DB_PORT"
  ];
  const ports = [];
  for (const key of keys) {
    const value = Number(values[key]);
    if (!Number.isInteger(value) || value < 1 || value > 65_535) {
      errors.push(`${key} must be a valid TCP port.`);
    } else if (key !== "DB_PORT") {
      ports.push(value);
    }
  }
  if (new Set(ports).size !== ports.length) errors.push("CXShop runtime ports must be unique.");
}

function validateOrigins(values, errors) {
  for (const key of [
    "API_URL",
    "WEB_URL",
    "PUBLIC_URL"
  ]) {
    try {
      if (values[key]) new URL(values[key]);
    } catch {
      errors.push(`${key} must be an absolute URL.`);
    }
  }
}

function validateIntegration(values, prefix, errors) {
  if (values[`${prefix}_ENABLED`] !== "1") return;
  for (const suffix of prefix.endsWith("FRAPPE")
    ? ["BASE_URL", "API_KEY", "API_SECRET", "WEBHOOK_SECRET"]
    : ["BASE_URL", "CLIENT_ID", "CLIENT_SECRET", "WEBHOOK_SECRET"]) {
    if (!values[`${prefix}_${suffix}`]) errors.push(`${prefix}_${suffix} is required when enabled.`);
  }
}

function validateOpenAi(values, errors) {
  if (!values.OPENAI_ENABLED) errors.push("OPENAI_ENABLED is required.");
  if (!values.OPENAI_URL) errors.push("OPENAI_URL is required.");
  if (!values.OPENAI_MODEL) errors.push("OPENAI_MODEL is required.");
  if (values.OPENAI_ENABLED === "1" && !values.OPENAI_API_KEY) {
    errors.push("OPENAI_API_KEY is required when OpenAI is enabled.");
  }
}

function validateSharedInfrastructure(values, errors) {
  if (values.INFRASTRUCTURE_MODE !== "cxapp-shared") return;
  if (values.SHARED_DOCKER_NETWORK !== "cxapp-network") {
    errors.push("Shared infrastructure must use the external cxapp-network.");
  }
  if (values.DB_NAME !== "cxshop_db") {
    errors.push("Shared MariaDB must use the isolated cxshop_db database.");
  }
  if (values.REDIS_PREFIX !== "cxshop:") {
    errors.push("Shared Redis must use the cxshop: key prefix.");
  }
  try {
    const redis = new URL(values.REDIS_URL);
    if (redis.pathname !== "/2") errors.push("Shared Redis must use database index 2.");
  } catch {
    errors.push("REDIS_URL must be a valid Redis URL.");
  }
  if (values.SHARED_MEDIA_VOLUME !== "cxapp-media-data") {
    errors.push("Shared FileBrowser must use the external cxapp-media-data volume.");
  }
  if (values.SHARED_MEDIA_ROOT !== "/srv/cxshop") {
    errors.push("Shared FileBrowser data must stay under /srv/cxshop.");
  }
}

function validateEnum(values, key, allowed, errors) {
  if (values[key] && !allowed.includes(values[key])) {
    errors.push(`${key} must be one of: ${allowed.join(", ")}.`);
  }
}

function validateProduction(values, errors) {
  if (values.DEV_LOGIN_AUTO === "1") {
    errors.push("Production must disable development auto-login.");
  }
  if (values.LOGIN_COOKIE_SECURE !== "1") {
    errors.push("Production requires a secure session cookie.");
  }
  if (values.API_HOST === "127.0.0.1") {
    errors.push("Production cannot use the local API host default.");
  }
  if (["manual", "console"].includes(values.PAYMENT_DRIVER)) {
    errors.push("Production requires a configured payment driver.");
  }
}

function isPlaceholder(value) {
  return /^(change-|replace-|example-|changeme)/iu.test(value);
}
