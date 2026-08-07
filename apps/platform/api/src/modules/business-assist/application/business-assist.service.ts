import { businessAssistRequestSchema, type BusinessAssistReceipt, type BusinessAssistResult, type SessionDto } from "@cxshop/contracts";
import { BusinessAssistRepository } from "../infrastructure/business-assist.repository";
import type { BusinessAdvisor } from "./business-advisor";

export class BusinessAssistService {
  constructor(
    private readonly repository: BusinessAssistRepository,
    private readonly advisor: BusinessAdvisor | undefined,
    private readonly model: string
  ) {}

  status() {
    return { enabled: Boolean(this.advisor), model: this.advisor ? this.model : null, delivery: "durable-job" as const };
  }

  async request(input: unknown, actor: SessionDto): Promise<BusinessAssistReceipt> {
    if (!this.advisor) throw new BusinessAssistUnavailableError();
    return this.repository.queue(businessAssistRequestSchema.parse(input), actor, this.model);
  }

  result(requestId: string, actor: SessionDto): Promise<BusinessAssistResult | undefined> {
    return this.repository.result(requestId, actor.actorId);
  }
}

export class BusinessAssistUnavailableError extends Error {}
