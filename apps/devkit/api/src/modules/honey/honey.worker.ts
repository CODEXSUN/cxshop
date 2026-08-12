import { honeyModelGateway } from "./honey.model-gateway.js";
import { honeyRepository } from "./honey.repository.js";
import type { HoneyModelMessage, HoneyWorkerInput } from "./honey.types.js";
import { createHoneyRunEvent } from "./honey.events.js";
import { planHoneyExecution } from "./honey.sync.js";
import { honeySkills } from "./honey.skills.js";

type WorkerStep = { label: string; output: string; role: string };

export class HoneyWorker {
  async process(input: HoneyWorkerInput) {
    const steps: WorkerStep[] = [];
    const connection = honeyModelGateway.settings();
    const plan = planHoneyExecution(input.mode, connection.provider);
    await honeyRepository.updateRun(input.runId, input.actorId, { status: "running" });
    steps.push({
      label: createHoneyRunEvent("honey.run.started", {
        mode: input.mode,
        provider: connection.provider,
        runId: input.runId,
        threadId: input.threadId
      }).eventName,
      output: plan.roles.join(", "),
      role: "orchestrator"
    });
    try {
      if (input.mode === "content-writer") {
        await this.specialist("researcher", researchPrompt(input.message), steps);
        await this.specialist("editor", editorPrompt(input.message, steps), steps);
        await this.specialist("seo-reviewer", seoPrompt(input.message, steps), steps);
      }
      const skills = await honeySkills.promptingContext(
        input.actorId.startsWith("shopper:") ? "shopper" : "staff"
      );
      const result = await honeyModelGateway.complete(finalPrompt(input, steps, skills));
      await honeyRepository.addMessage(input.threadId, input.actorId, "assistant", result);
      await honeyRepository.updateRun(input.runId, input.actorId, {
        result_text: result,
        status: "completed",
        steps_json: JSON.stringify(steps)
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Piko agent run failed.";
      await honeyRepository.updateRun(input.runId, input.actorId, {
        error_text: message,
        status: "failed",
        steps_json: JSON.stringify(steps)
      });
      throw error;
    }
  }

  private async specialist(role: string, messages: HoneyModelMessage[], steps: WorkerStep[]) {
    const output = await honeyModelGateway.complete(messages);
    steps.push({ label: `${role} completed`, output, role });
  }
}

function researchPrompt(request: string): HoneyModelMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Piko's research sub-agent. Extract audience, intent, facts to verify, and a useful outline. Do not invent facts."
    },
    { role: "user", content: request }
  ];
}

function editorPrompt(request: string, steps: WorkerStep[]): HoneyModelMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Piko's editorial sub-agent. Turn the brief and research into a clear content draft. Preserve uncertainty."
    },
    { role: "user", content: `${request}\n\nResearch:\n${steps[0]?.output ?? ""}` }
  ];
}

function seoPrompt(request: string, steps: WorkerStep[]): HoneyModelMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Piko's SEO and quality sub-agent. Suggest a title, description, keywords, accessibility improvements, and factual risks. Be concise."
    },
    { role: "user", content: `${request}\n\nDraft:\n${steps[1]?.output ?? ""}` }
  ];
}

function finalPrompt(
  input: HoneyWorkerInput,
  steps: WorkerStep[],
  skills: Array<{ content: string; name: string }>
): HoneyModelMessage[] {
  const role =
    input.mode === "content-writer"
      ? "You are Piko, CXShop's panda storekeeper and content writer. Produce polished, publish-ready content using the specialist work. Include a title and clearly mark any facts that need verification."
      : "You are Piko, CXShop's friendly panda storekeeper. Help shoppers and staff with catalog, storefront, product comparison, customer, and business tasks. Never claim to perform an action you did not perform, never invent product facts, and never expose private configuration.";
  return [
    {
      role: "system",
      content: `${role}${skills.length ? `\n\nApproved business skills:\n${skills.map((skill) => `--- ${skill.name} ---\n${skill.content}`).join("\n\n")}` : ""}`
    },
    {
      role: "user",
      content: `${input.message}${steps.length ? `\n\nSpecialist work:\n${steps.map((step) => `[${step.role}]\n${step.output}`).join("\n\n")}` : ""}`
    }
  ];
}

export const honeyWorker = new HoneyWorker();
