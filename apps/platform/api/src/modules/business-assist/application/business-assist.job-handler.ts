import type { BusinessAdvisor } from "./business-advisor";
import { BusinessAssistRepository } from "../infrastructure/business-assist.repository";

export class BusinessAssistJobHandler {
  constructor(private readonly repository: BusinessAssistRepository, private readonly advisor: BusinessAdvisor) {}

  async handle(requestId: string): Promise<void> {
    const request = await this.repository.load(requestId);
    if (!request) throw new Error("Business Assist request does not exist");
    await this.repository.markProcessing(requestId);
    try {
      const advice = await this.advisor.advise(request);
      await this.repository.complete(requestId, advice.text, advice.providerResponseId);
    } catch (error) {
      await this.repository.fail(requestId, providerErrorCode(error));
      throw error;
    }
  }
}

function providerErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") return `OPENAI_HTTP_${error.status}`;
  return "OPENAI_REQUEST_FAILED";
}
