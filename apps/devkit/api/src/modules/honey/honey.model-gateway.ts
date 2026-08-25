import { AppError } from "@cxshop/framework/errors";
import type { HoneyModelMessage, HoneyProvider } from "./honey.types.js";

type HoneyModelSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: HoneyProvider;
};

export class HoneyModelGateway {
  settings() {
    const settings = readSettings();
    return {
      configured: settings.provider === "opencode" || Boolean(settings.apiKey),
      endpoint: safeEndpoint(settings.baseUrl),
      model: settings.model,
      provider: settings.provider
    };
  }

  async complete(messages: HoneyModelMessage[]) {
    const settings = readSettings();
    if (settings.provider !== "opencode" && !settings.apiKey) {
      throw AppError.validation(`Piko ${settings.provider} is not configured.`);
    }
    const response = await fetch(`${settings.baseUrl.replace(/\/$/u, "")}/chat/completions`, {
      body: JSON.stringify({ messages, model: settings.model }),
      headers: {
        "Content-Type": "application/json",
        ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
        ...(settings.provider === "openrouter"
          ? { "HTTP-Referer": "https://codexsun.com", "X-Title": "CXShop Piko" }
          : {})
      },
      method: "POST",
      signal: AbortSignal.timeout(120_000)
    });
    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    } | null;
    if (!response.ok) {
      throw new Error(payload?.error?.message || `Piko provider returned HTTP ${response.status}.`);
    }
    const content = payload?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Piko provider returned an empty response.");
    return content;
  }

  async testConnection() {
    const output = await this.complete([
      { content: "Return only: CONNECTION READY", role: "user" }
    ]);
    return { ...this.settings(), ready: output.includes("CONNECTION READY") };
  }
}

function readSettings(): HoneyModelSettings {
  const requested = process.env.CXSHOP_AI_PROVIDER?.trim().toLowerCase();
  const provider: HoneyProvider =
    requested === "openrouter" || requested === "opencode" ? requested : "openai";
  const defaults = {
    openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-5.6-terra" },
    openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-5.6-terra" },
    opencode: { baseUrl: "http://127.0.0.1:4096/v1", model: "opencode" }
  }[provider];
  return {
    apiKey: process.env.CXSHOP_AI_API_KEY?.trim() ?? "",
    baseUrl: process.env.CXSHOP_AI_BASE_URL?.trim() || defaults.baseUrl,
    model: process.env.CXSHOP_AI_MODEL?.trim() || defaults.model,
    provider
  };
}

function safeEndpoint(value: string) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid";
  }
}

export const honeyModelGateway = new HoneyModelGateway();
