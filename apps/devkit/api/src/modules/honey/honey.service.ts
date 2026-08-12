import { honeyModelGateway } from "./honey.model-gateway.js";
import { honeyRepository } from "./honey.repository.js";
import type { HoneyChatInput } from "./honey.types.js";
import { honeyWorker } from "./honey.worker.js";

export class HoneyService {
  connection() {
    return honeyModelGateway.settings();
  }

  async conversations(actorId: string) {
    const rows = await honeyRepository.listThreads(actorId);
    return rows.map((row) => ({
      id: row.uuid,
      title: row.title,
      updatedAt: new Date(row.updated_at).toISOString()
    }));
  }

  async conversation(threadId: string, actorId: string) {
    const [thread, messages, runs] = await Promise.all([
      honeyRepository.findThread(threadId, actorId),
      honeyRepository.messages(threadId, actorId),
      honeyRepository.runs(threadId, actorId)
    ]);
    return {
      id: thread.uuid,
      messages: messages.map((row) => ({
        body: row.body,
        createdAt: new Date(row.created_at).toISOString(),
        id: row.uuid,
        role: row.role
      })),
      runs: runs.map((row) => ({
        createdAt: new Date(row.created_at).toISOString(),
        error: row.error_text,
        id: row.uuid,
        mode: row.mode,
        model: row.model,
        provider: row.provider,
        status: row.status,
        steps: JSON.parse(row.steps_json) as unknown
      })),
      title: thread.title
    };
  }

  archiveConversation(threadId: string, actorId: string) {
    return honeyRepository.archiveThread(threadId, actorId);
  }

  async chat(input: HoneyChatInput, actorId: string) {
    const thread = input.threadId
      ? await honeyRepository.findThread(input.threadId, actorId)
      : await honeyRepository.createThread(actorId, input.message);
    await honeyRepository.addMessage(thread.uuid, actorId, "user", input.message);
    const connection = honeyModelGateway.settings();
    const runId = await honeyRepository.createRun({
      actorId,
      message: input.message,
      mode: input.mode,
      model: connection.model,
      provider: connection.provider,
      threadId: thread.uuid
    });
    await honeyWorker.process({
      actorId,
      message: input.message,
      mode: input.mode,
      runId,
      threadId: thread.uuid
    });
    return this.conversation(thread.uuid, actorId);
  }
}
