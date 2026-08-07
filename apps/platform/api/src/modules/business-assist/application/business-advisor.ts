import type { BusinessAssistRequest } from "@cxshop/contracts";

export type BusinessAdvice = { text: string; providerResponseId: string };

export interface BusinessAdvisor {
  advise(request: BusinessAssistRequest): Promise<BusinessAdvice>;
}
