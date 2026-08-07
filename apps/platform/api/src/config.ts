import { z } from "zod";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const environmentFile = resolve(process.env.INIT_CWD ?? process.cwd(), ".env");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  API_PORT: z.coerce.number().int().positive(),
  API_URL: z.string().url(),
  API_BODY_MAX_BYTES: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
  RATE_LIMIT_WINDOW: z.string().min(1),
  GRAPHQL_QUERY_MAX_BYTES: z.coerce.number().int().positive(),
  DB_URL: z.string().min(1).optional(),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  LOGIN_SECRET: z.string().min(32),
  LOGIN_SESSION_HOURS: z.coerce.number().int().positive(),
  LOGIN_COOKIE_NAME: z.string().min(1),
  LOGIN_COOKIE_SECURE: z.enum(["0", "1"]),
  LOGIN_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]),
  REDIS_URL: z.string().url().optional(),
  QUEUE_POLL_MS: z.coerce.number().int().positive(),
  QUEUE_MAX_ATTEMPTS: z.coerce.number().int().positive(),
  DEV_LOGIN_AUTO: z.enum(["0", "1"]),
  DEV_LOGIN_STORE_EMAIL: z.string().email(),
  DEV_LOGIN_VENDOR_EMAIL: z.string().email(),
  DEV_LOGIN_ADMIN_EMAIL: z.string().email(),
  DEV_LOGIN_SA_EMAIL: z.string().email(),
  ALLOWED_WEB_URLS: z.string().min(1),
  OPENAI_ENABLED: z.enum(["0", "1"]),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_URL: z.string().url(),
  OPENAI_MODEL: z.string().min(1),
  OPENAI_REASONING: z.enum(["none", "low", "medium", "high", "xhigh", "max"]),
  OPENAI_OUTPUT_MAX_TOKENS: z.coerce.number().int().positive()
});

export function loadConfig() {
  const config = configSchema.parse(process.env);
  const databaseUrl = config.DB_URL ?? `mysql://${encodeURIComponent(config.DB_USER)}:${encodeURIComponent(config.DB_PASSWORD)}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
  return {
    ...config,
    allowedWebUrls: config.ALLOWED_WEB_URLS.split(",").map(value => value.trim()),
    authSecret: config.LOGIN_SECRET,
    databaseUrl
  };
}
