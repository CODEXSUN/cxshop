import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import { buildSchema, graphql } from "graphql";
import { sql } from "kysely";
import { loadConfig } from "./config";
import { DatabaseProvider } from "./infrastructure/database";
import { IdentityRepository } from "./modules/identity/identity.repository";
import { registerIdentityRoutes } from "./modules/identity/identity.routes";
import { IdentityService } from "./modules/identity/identity.service";
import { ProjectRepository } from "./modules/project-management/project.repository";
import { registerProjectRoutes } from "./modules/project-management/project.routes";
import { BusinessAssistRepository } from "./modules/business-assist/infrastructure/business-assist.repository";
import { BusinessAssistService } from "./modules/business-assist/application/business-assist.service";
import { OpenAiBusinessAdvisor } from "./modules/business-assist/infrastructure/openai-business-advisor";
import { registerBusinessAssistRoutes } from "./modules/business-assist/api/business-assist.routes";

export async function createApp() {
  const config = loadConfig();
  const app = Fastify({ logger: true, trustProxy: true, bodyLimit: config.API_BODY_MAX_BYTES });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(cors, { credentials: true, origin: config.allowedWebUrls });
  await app.register(rateLimit, { max: config.RATE_LIMIT_MAX, timeWindow: config.RATE_LIMIT_WINDOW });
  await app.register(swagger, { openapi: { info: { title: "CXShop API", version: "1.1.0" }, servers: [{ url: config.API_URL }] } });
  await app.register(scalar, { routePrefix: "/docs", configuration: { theme: "kepler", layout: "modern" } });
  app.get("/openapi.json", async () => app.swagger());
  const graphSchema = buildSchema("type Query { service: Service! } type Service { name: String!, status: String! }");
  app.post("/graphql", async (request, reply) => {
    const source = (request.body as { query?: unknown } | undefined)?.query;
    if (typeof source !== "string" || source.length > config.GRAPHQL_QUERY_MAX_BYTES) return reply.code(400).send({ errors: [{ message: "invalid_query" }] });
    return graphql({ schema: graphSchema, source, rootValue: { service: () => ({ name: "cxshop-api", status: "ok" }) } });
  });
  const database = new DatabaseProvider(config.databaseUrl);
  const identity = new IdentityService(new IdentityRepository(database.connection), config.authSecret, config);
  registerIdentityRoutes(app, identity, {
    name: config.LOGIN_COOKIE_NAME,
    maxAge: config.LOGIN_SESSION_HOURS * 3_600,
    secure: config.LOGIN_COOKIE_SECURE === "1",
    sameSite: config.LOGIN_COOKIE_SAME_SITE
  });
  registerProjectRoutes(app, new ProjectRepository(database.connection), identity, config.LOGIN_COOKIE_NAME);
  const advisor = createBusinessAdvisor(config);
  const businessAssist = new BusinessAssistService(new BusinessAssistRepository(database.connection, config.QUEUE_MAX_ATTEMPTS), advisor, config.OPENAI_MODEL);
  registerBusinessAssistRoutes(app, businessAssist, identity, config.LOGIN_COOKIE_NAME);
  app.get("/health", async () => { await sql`SELECT 1`.execute(database.connection); return { status: "ok", service: "cxshop-api" }; });
  return { app, config };
}

export function createBusinessAdvisor(config: ReturnType<typeof loadConfig>) {
  if (config.OPENAI_ENABLED !== "1") return undefined;
  if (!config.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required when OpenAI is enabled");
  return new OpenAiBusinessAdvisor({
    apiKey: config.OPENAI_API_KEY,
    baseURL: config.OPENAI_URL,
    model: config.OPENAI_MODEL,
    reasoningEffort: config.OPENAI_REASONING,
    maxOutputTokens: config.OPENAI_OUTPUT_MAX_TOKENS
  });
}
