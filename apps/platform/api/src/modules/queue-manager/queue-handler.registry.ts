export type QueueJobHandler = (
  payload: Record<string, unknown>
) => Promise<Record<string, unknown>>;

const handlers = new Map<string, QueueJobHandler>();

export function registerQueueJobHandler(jobName: string, handler: QueueJobHandler) {
  handlers.set(jobName, handler);
}

export function findQueueJobHandler(jobName: string) {
  return handlers.get(jobName) ?? null;
}
