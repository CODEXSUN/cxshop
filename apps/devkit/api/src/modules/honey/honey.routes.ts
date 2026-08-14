import type { FastifyInstance } from "fastify";
import { ok } from "@cxshop/framework/http";
import { z } from "zod";
import { requireDevkitActor } from "../../request-context.js";
import { HoneyService } from "./honey.service.js";
import { honeyModelGateway } from "./honey.model-gateway.js";
import { honeySkills } from "./honey.skills.js";
import { AppError } from "@cxshop/framework/errors";
import { pikoCodexForActor } from "./piko-codex.client.js";

const service = new HoneyService();
const idSchema = z.object({ uuid: z.string().length(16) }).strict();
const chatSchema = z
  .object({
    message: z.string().trim().min(1).max(20_000),
    mode: z.enum(["chat", "content-writer"]).default("chat"),
    threadId: z.string().length(16).nullable().optional()
  })
  .strict();
const mascotSettingsSchema = z
  .object({
    behavior: z.enum(["roam", "stay"]),
    xRatio: z.number().min(0).max(1),
    yRatio: z.number().min(0).max(1)
  })
  .strict();

export async function registerHoneyRoutes(app: FastifyInstance) {
  app.get("/honey/connection", async (request) =>
    ok(service.connection(), { requestId: request.id })
  );
  app.get("/honey/conversations", async (request) =>
    ok(await service.conversations(requireDevkitActor().id), { requestId: request.id })
  );
  app.get("/honey/conversations/:uuid", async (request) => {
    const { uuid } = idSchema.parse(request.params);
    return ok(await service.conversation(uuid, requireDevkitActor().id), { requestId: request.id });
  });
  app.put("/honey/conversations/:uuid/archive", async (request) => {
    const { uuid } = idSchema.parse(request.params);
    return ok(await service.archiveConversation(uuid, requireDevkitActor().id), {
      requestId: request.id
    });
  });
  app.post("/honey/chat", async (request) =>
    ok(await service.chat(chatSchema.parse(request.body), requireDevkitActor().id), {
      requestId: request.id
    })
  );
  app.get("/honey/system/connector", async (request) => {
    requireSystemAdmin();
    return ok(honeyModelGateway.settings(), { requestId: request.id });
  });
  app.get("/honey/system/mascot", async (request) => {
    requireMascotAdmin();
    return ok(await service.mascotSettings(), { requestId: request.id });
  });
  app.put("/honey/system/mascot", async (request) => {
    const actor = requireMascotAdmin();
    return ok(
      await service.updateMascotSettings(mascotSettingsSchema.parse(request.body), actor.id),
      { requestId: request.id }
    );
  });
  app.post("/honey/system/connector/test", async (request) => {
    requireSystemAdmin();
    return ok(await honeyModelGateway.testConnection(), { requestId: request.id });
  });
  app.get("/honey/codex/status", async (request) => {
    const actor = requireDevkitActor();
    return ok(await pikoCodexForActor(actor).status(), { requestId: request.id });
  });
  app.post("/honey/codex/device-login", async (request) => {
    const actor = requireDevkitActor();
    return ok(await pikoCodexForActor(actor).startDeviceLogin(), { requestId: request.id });
  });
  app.post("/honey/codex/browser-login", async (request) => {
    const actor = requireDevkitActor();
    return ok(await pikoCodexForActor(actor).startBrowserLogin(), { requestId: request.id });
  });
  app.post("/honey/codex/login-cancel", async (request) => {
    const actor = requireDevkitActor();
    const { loginId } = z.object({ loginId: z.string().uuid() }).strict().parse(request.body);
    await pikoCodexForActor(actor).cancelLogin(loginId);
    return ok({ cancelled: true }, { requestId: request.id });
  });
  app.post("/honey/codex/logout", async (request) => {
    const actor = requireDevkitActor();
    await pikoCodexForActor(actor).logout();
    return ok({ disconnected: true }, { requestId: request.id });
  });
  app.get("/honey/system/skills", async (request) => {
    requireSystemAdmin();
    return ok(await honeySkills.list(), { requestId: request.id });
  });
  app.post("/honey/system/skills", async (request) => {
    requireSystemAdmin();
    const input = z
      .object({ description: z.string().min(10).max(500), name: z.string().min(1).max(64) })
      .strict()
      .parse(request.body);
    return ok(await honeySkills.create(input), { requestId: request.id });
  });
  app.post("/honey/system/skills/:name/files", async (request) => {
    requireSystemAdmin();
    const { name } = z
      .object({ name: z.string().min(1).max(64) })
      .strict()
      .parse(request.params);
    const input = z
      .object({ content: z.string().max(1_000_000), file: z.string().min(1).max(500) })
      .strict()
      .parse(request.body);
    return ok(await honeySkills.addReference(name, input.file, input.content), {
      requestId: request.id
    });
  });
  app.put("/honey/system/skills/:name/usage", async (request) => {
    requireSystemAdmin();
    const { name } = z
      .object({ name: z.string().min(1).max(64) })
      .strict()
      .parse(request.params);
    const usage = z
      .object({ prompting: z.boolean(), review: z.boolean(), shopper: z.boolean() })
      .strict()
      .parse(request.body);
    return ok(await honeySkills.setUsage(name, usage), { requestId: request.id });
  });
}

function requireSystemAdmin() {
  const actor = requireDevkitActor();
  if (!actor.roles.includes("super_admin"))
    throw AppError.forbidden("System Admin access is required.");
  return actor;
}

function requireMascotAdmin() {
  const actor = requireDevkitActor();
  if (!actor.roles.some((role) => role === "super_admin" || role === "tenant_admin"))
    throw AppError.forbidden("Admin access is required to configure Piko.");
  return actor;
}
