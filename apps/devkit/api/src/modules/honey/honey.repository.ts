import { randomBytes } from "node:crypto";
import { AppError } from "@cxshop/framework/errors";
import { getDevkitDatabase } from "../../database/devkit-database.js";
import type { HoneyMode, HoneyProvider, HoneyRole, PikoMascotSettings } from "./honey.types.js";

class HoneyRepository {
  async mascotSettings(): Promise<PikoMascotSettings> {
    const row = await getDevkitDatabase()
      .selectFrom("devkit_honey_mascot_settings")
      .select(["behavior", "x_ratio", "y_ratio"])
      .where("id", "=", 1)
      .executeTakeFirstOrThrow();
    return {
      behavior: row.behavior === "stay" ? "stay" : "roam",
      xRatio: Number(row.x_ratio),
      yRatio: Number(row.y_ratio)
    };
  }

  async updateMascotSettings(settings: PikoMascotSettings, actorId: string) {
    await getDevkitDatabase()
      .updateTable("devkit_honey_mascot_settings")
      .set({
        behavior: settings.behavior,
        updated_by: actorId,
        x_ratio: settings.xRatio,
        y_ratio: settings.yRatio
      })
      .where("id", "=", 1)
      .executeTakeFirst();
    return this.mascotSettings();
  }

  listThreads(actorId: string) {
    return getDevkitDatabase()
      .selectFrom("devkit_honey_threads")
      .selectAll()
      .where("actor_id", "=", actorId)
      .where("status", "=", "active")
      .orderBy("updated_at", "desc")
      .limit(50)
      .execute();
  }

  async findThread(uuid: string, actorId: string) {
    const row = await getDevkitDatabase()
      .selectFrom("devkit_honey_threads")
      .selectAll()
      .where("uuid", "=", uuid)
      .where("actor_id", "=", actorId)
      .executeTakeFirst();
    if (!row) throw AppError.notFound("Piko conversation was not found.");
    return row;
  }

  async createThread(actorId: string, title: string) {
    const uuid = id();
    await getDevkitDatabase()
      .insertInto("devkit_honey_threads")
      .values({ actor_id: actorId, status: "active", title: title.slice(0, 240), uuid })
      .execute();
    return this.findThread(uuid, actorId);
  }

  async archiveThread(uuid: string, actorId: string) {
    await this.findThread(uuid, actorId);
    await getDevkitDatabase()
      .updateTable("devkit_honey_threads")
      .set({ status: "archived", updated_at: new Date() })
      .where("uuid", "=", uuid)
      .where("actor_id", "=", actorId)
      .execute();
    return { archived: true as const, id: uuid };
  }

  async addMessage(threadId: string, actorId: string, role: HoneyRole, body: string) {
    await this.findThread(threadId, actorId);
    await getDevkitDatabase()
      .insertInto("devkit_honey_messages")
      .values({ actor_id: actorId, body, role, thread_uuid: threadId, uuid: id() })
      .execute();
    await getDevkitDatabase()
      .updateTable("devkit_honey_threads")
      .set({ updated_at: new Date() })
      .where("uuid", "=", threadId)
      .where("actor_id", "=", actorId)
      .execute();
  }

  messages(threadId: string, actorId: string) {
    return getDevkitDatabase()
      .selectFrom("devkit_honey_messages")
      .selectAll()
      .where("thread_uuid", "=", threadId)
      .where("actor_id", "=", actorId)
      .orderBy("created_at", "asc")
      .limit(100)
      .execute();
  }

  async createRun(input: {
    actorId: string;
    message: string;
    mode: HoneyMode;
    model: string;
    provider: HoneyProvider;
    threadId: string;
  }) {
    const uuid = id();
    await getDevkitDatabase()
      .insertInto("devkit_honey_runs")
      .values({
        actor_id: input.actorId,
        error_text: null,
        input_text: input.message,
        mode: input.mode,
        model: input.model,
        provider: input.provider,
        result_text: null,
        status: "pending",
        steps_json: "[]",
        thread_uuid: input.threadId,
        uuid
      })
      .execute();
    return uuid;
  }

  runs(threadId: string, actorId: string) {
    return getDevkitDatabase()
      .selectFrom("devkit_honey_runs")
      .selectAll()
      .where("thread_uuid", "=", threadId)
      .where("actor_id", "=", actorId)
      .orderBy("created_at", "desc")
      .limit(20)
      .execute();
  }

  async updateRun(
    uuid: string,
    actorId: string,
    values: {
      error_text?: string | null;
      result_text?: string | null;
      status: string;
      steps_json?: string;
    }
  ) {
    const result = await getDevkitDatabase()
      .updateTable("devkit_honey_runs")
      .set(values)
      .where("uuid", "=", uuid)
      .where("actor_id", "=", actorId)
      .executeTakeFirst();
    if (Number(result.numUpdatedRows) === 0)
      throw AppError.notFound("Piko agent run was not found.");
  }
}

function id() {
  return randomBytes(8).toString("hex");
}

export const honeyRepository = new HoneyRepository();
