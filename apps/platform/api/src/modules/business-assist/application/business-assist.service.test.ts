import assert from "node:assert/strict";
import test from "node:test";
import type { BusinessAssistReceipt } from "@cxshop/contracts";
import { BusinessAssistService, BusinessAssistUnavailableError } from "./business-assist.service";
import type { BusinessAdvisor } from "./business-advisor";
import type { BusinessAssistRepository } from "../infrastructure/business-assist.repository";

const receipt: BusinessAssistReceipt = { requestId: "466b04eb-c722-421b-b856-1d01238870bb", status: "queued" };
const repository = { queue: async () => receipt } as unknown as BusinessAssistRepository;
const advisor = { advise: async () => ({ text: "Advice", providerResponseId: "response-1" }) } as BusinessAdvisor;
const actor = { actorId: "89a7c29b-e818-4454-888f-a59f4185b7a2", email: "admin@example.com", displayName: "Admin", portal: "admin" as const, permissions: ["platform.business-assist.use"] };

test("disabled Business Assist rejects requests without invoking a provider", async () => {
  const service = new BusinessAssistService(repository, undefined, "configured-model");
  assert.deepEqual(service.status(), { enabled: false, model: null, delivery: "durable-job" });
  await assert.rejects(service.request({ question: "How can we improve vendor operations?", area: "vendor-operations", context: {} }, actor), BusinessAssistUnavailableError);
});

test("enabled Business Assist validates and queues an owned request", async () => {
  const service = new BusinessAssistService(repository, advisor, "configured-model");
  assert.deepEqual(await service.request({ question: "How can we improve vendor operations?", area: "vendor-operations", context: {} }, actor), receipt);
});
