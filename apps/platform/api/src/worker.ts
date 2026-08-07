import { setTimeout as wait } from "node:timers/promises";
import { createBusinessAdvisor } from "./app";
import { loadConfig } from "./config";
import { DatabaseProvider } from "./infrastructure/database";
import { DurableJobRepository } from "./infrastructure/queue/durable-job.repository";
import { BusinessAssistJobHandler } from "./modules/business-assist/application/business-assist.job-handler";
import { BusinessAssistRepository } from "./modules/business-assist/infrastructure/business-assist.repository";

const config = loadConfig();
const advisor = createBusinessAdvisor(config);
if (!advisor) {
  console.log("CXShop Business Assist worker is disabled.");
  process.exit(0);
}

const database = new DatabaseProvider(config.databaseUrl);
const jobs = new DurableJobRepository(database.connection);
const handler = new BusinessAssistJobHandler(new BusinessAssistRepository(database.connection, config.QUEUE_MAX_ATTEMPTS), advisor);

for (;;) {
  const job = await jobs.claim("business-assist.generate");
  if (!job) { await wait(config.QUEUE_POLL_MS); continue; }
  try {
    const payload = JSON.parse(job.payload) as { requestId?: unknown };
    if (typeof payload.requestId !== "string") throw new Error("Business Assist job payload is invalid");
    await handler.handle(payload.requestId);
    await jobs.complete(job.id);
  } catch (error) {
    console.error("Business Assist job failed", error);
    await jobs.retryOrFail(job);
  }
}
