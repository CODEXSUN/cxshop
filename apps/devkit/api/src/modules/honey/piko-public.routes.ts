import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Kysely } from "kysely";
import { ok } from "@cxshop/framework/http";
import { z } from "zod";
import { bootstrapDevkitDatabase, runWithDevkitDatabase } from "../../database/index.js";
import type { DevkitDatabase } from "../../database/index.js";
import { runWithDevkitActor } from "../../request-context.js";
import { HoneyService } from "./honey.service.js";

const service = new HoneyService();
const requestSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    threadId: z.string().length(16).nullable().optional(),
    visitorId: z.string().regex(/^[a-f0-9]{16}$/u)
  })
  .strict();

export type PikoPublicHostAdapter = {
  resolveDatabase(request: FastifyRequest): Kysely<DevkitDatabase>;
};

export async function registerPikoPublicRoutes(
  app: FastifyInstance,
  adapter: PikoPublicHostAdapter
) {
  app.get("/public/piko/mascot", async (request) => {
    const database = adapter.resolveDatabase(request);
    await bootstrapDevkitDatabase(database);
    const settings = await runWithDevkitDatabase(database, () => service.mascotSettings());
    return ok(settings, { requestId: request.id });
  });
  app.post("/public/piko/chat", async (request) => {
    const input = requestSchema.parse(request.body);
    const database = adapter.resolveDatabase(request);
    const actorId = `shopper:${input.visitorId}`;
    await bootstrapDevkitDatabase(database);
    const conversation = await runWithDevkitDatabase(database, () =>
      runWithDevkitActor(
        {
          id: actorId,
          permissions: ["storefront.piko.chat"],
          roles: ["shopper"],
          storageScope: "storefront"
        },
        () =>
          service.chat({ message: input.message, mode: "chat", threadId: input.threadId }, actorId)
      )
    );
    return ok(
      { id: conversation.id, messages: conversation.messages, title: conversation.title },
      { requestId: request.id }
    );
  });
}
