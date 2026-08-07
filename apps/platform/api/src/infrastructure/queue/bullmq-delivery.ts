import { Queue } from "bullmq";
import IORedis from "ioredis";

export class BullMqDelivery {
  private readonly connection: IORedis;
  private readonly queue: Queue;

  constructor(redisUrl: string) {
    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue("cxshop-delivery", { connection: this.connection, prefix: "cxshop" });
  }

  async signalDurableJob(jobId: string): Promise<void> {
    await this.queue.add("durable-job-ready", { jobId }, { jobId, attempts: 1, removeOnComplete: 1_000 });
  }

  async scheduleDispatcher(): Promise<void> {
    await this.queue.upsertJobScheduler("durable-dispatcher", { every: 5_000 }, { name: "dispatch-durable-jobs", data: {} });
  }

  async close(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }
}
