import { sql } from "kysely";
import type { DatabaseConnection } from "@cxshop/framework";

export type DurableJob = { id: number; payload: string; attempts: number; maxAttempts: number };

export class DurableJobRepository {
  constructor(private readonly database: DatabaseConnection) {}

  claim(jobName: string): Promise<DurableJob | undefined> {
    return this.database.transaction().execute(async transaction => {
      const job = await transaction.selectFrom("cxshop_jobs").select(["id", "payload", "attempts", "max_attempts as maxAttempts"]).where("job_name", "=", jobName).where("status", "=", "ready").where("available_at", "<=", new Date()).orderBy("id").forUpdate().skipLocked().executeTakeFirst();
      if (!job) return undefined;
      await transaction.updateTable("cxshop_jobs").set({ status: "running", attempts: sql`attempts + 1` }).where("id", "=", job.id).execute();
      return { ...job, attempts: job.attempts + 1 };
    });
  }

  async complete(id: number): Promise<void> {
    await this.database.updateTable("cxshop_jobs").set({ status: "complete" }).where("id", "=", id).execute();
  }

  async retryOrFail(job: DurableJob): Promise<void> {
    const exhausted = job.attempts >= job.maxAttempts;
    await this.database.updateTable("cxshop_jobs").set({ status: exhausted ? "failed" : "ready", available_at: new Date(Date.now() + retryDelay(job.attempts)) }).where("id", "=", job.id).execute();
  }
}

function retryDelay(attempt: number): number {
  return Math.min(300_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}
