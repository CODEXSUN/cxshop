import { randomUUID } from "node:crypto";
import type { BusinessAssistReceipt, BusinessAssistRequest, BusinessAssistResult, SessionDto } from "@cxshop/contracts";
import type { DatabaseConnection } from "@cxshop/framework";

export class BusinessAssistRepository {
  constructor(private readonly database: DatabaseConnection, private readonly maxAttempts: number) {}

  async queue(request: BusinessAssistRequest, actor: SessionDto, model: string): Promise<BusinessAssistReceipt> {
    const requestId = randomUUID();
    const jobId = randomUUID();
    await this.database.transaction().execute(async transaction => {
      await transaction.insertInto("cxshop_business_assist_requests").values({
        public_id: requestId,
        actor_public_id: actor.actorId,
        portal: actor.portal,
        area: request.area,
        question: request.question,
        context: JSON.stringify(request.context),
        model,
        response_text: null,
        provider_response_id: null,
        error_code: null,
        completed_at: null
      }).execute();
      await transaction.insertInto("cxshop_jobs").values({
        public_id: jobId,
        job_name: "business-assist.generate",
        job_version: 1,
        idempotency_key: `business-assist:${requestId}`,
        correlation_id: requestId,
        payload: JSON.stringify({ requestId }),
        max_attempts: this.maxAttempts
      }).execute();
    });
    return { requestId, status: "queued" };
  }

  async load(requestId: string): Promise<BusinessAssistRequest | undefined> {
    const row = await this.database.selectFrom("cxshop_business_assist_requests").select(["question", "area", "context"]).where("public_id", "=", requestId).executeTakeFirst();
    if (!row) return undefined;
    return { question: row.question, area: row.area as BusinessAssistRequest["area"], context: JSON.parse(row.context) as Record<string, string> };
  }

  async result(requestId: string, actorId: string): Promise<BusinessAssistResult | undefined> {
    const row = await this.database.selectFrom("cxshop_business_assist_requests").select(["public_id as requestId", "status", "response_text as response", "error_code as errorCode"]).where("public_id", "=", requestId).where("actor_public_id", "=", actorId).executeTakeFirst();
    return row as BusinessAssistResult | undefined;
  }

  async markProcessing(requestId: string): Promise<void> {
    await this.database.updateTable("cxshop_business_assist_requests").set({ status: "processing", error_code: null }).where("public_id", "=", requestId).where("status", "in", ["queued", "failed"]).execute();
  }

  async complete(requestId: string, text: string, providerResponseId: string): Promise<void> {
    await this.database.updateTable("cxshop_business_assist_requests").set({ status: "complete", response_text: text, provider_response_id: providerResponseId, completed_at: new Date() }).where("public_id", "=", requestId).execute();
  }

  async fail(requestId: string, errorCode: string): Promise<void> {
    await this.database.updateTable("cxshop_business_assist_requests").set({ status: "failed", error_code: errorCode }).where("public_id", "=", requestId).execute();
  }
}
