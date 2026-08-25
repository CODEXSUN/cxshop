import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { AppError } from "@cxshop/framework/errors";
import type { DevkitActor } from "../../request-context.js";

type PendingRequest = {
  reject: (error: Error) => void;
  resolve: (value: unknown) => void;
};

type ServerMessage = {
  error?: { message?: string };
  id?: number;
  method?: string;
  result?: unknown;
};

export type PikoCodexStatus = {
  accountType: string | null;
  available: boolean;
  connected: boolean;
  email: string | null;
  error: string | null;
  planType: string | null;
};

class PikoCodexClient {
  private lastError: string | null = null;
  private nextId = 1;
  private readonly pending = new Map<number, PendingRequest>();
  private process: ChildProcessWithoutNullStreams | null = null;
  private startup: Promise<void> | null = null;

  constructor(private readonly actor: DevkitActor) {}

  async status(): Promise<PikoCodexStatus> {
    try {
      await this.ensureStarted();
      const result = (await this.request("account/read", { refreshToken: false })) as {
        account?: { email?: string | null; planType?: string | null; type?: string } | null;
      };
      return {
        accountType: result.account?.type ?? null,
        available: true,
        connected: Boolean(result.account),
        email: result.account?.email ?? null,
        error: null,
        planType: result.account?.planType ?? null
      };
    } catch (error) {
      return {
        accountType: null,
        available: false,
        connected: false,
        email: null,
        error: error instanceof Error ? error.message : "Codex App Server is unavailable.",
        planType: null
      };
    }
  }

  async startDeviceLogin() {
    await this.ensureStarted();
    return this.request("account/login/start", { type: "chatgptDeviceCode" });
  }

  async startBrowserLogin() {
    await this.ensureStarted();
    return this.request("account/login/start", {
      appBrand: "chatgpt",
      type: "chatgpt",
      useHostedLoginSuccessPage: true
    });
  }

  async cancelLogin(loginId: string) {
    await this.ensureStarted();
    await this.request("account/login/cancel", { loginId });
  }

  async logout() {
    await this.ensureStarted();
    await this.request("account/logout", {});
  }

  private async ensureStarted() {
    if (this.process && !this.process.killed) return;
    if (!this.startup) this.startup = this.start();
    try {
      await this.startup;
    } finally {
      this.startup = null;
    }
  }

  private async start() {
    const command = resolveCodexCommand();
    const codexHome = actorCodexHome(this.actor);
    mkdirSync(codexHome, { recursive: true });
    const child = spawn(command.executable, command.args, {
      cwd: process.cwd(),
      env: { ...process.env, CODEX_HOME: codexHome },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    this.process = child;
    createInterface({ input: child.stdout }).on("line", (line) => this.handleLine(line));
    child.stderr.on("data", (chunk: Buffer) => {
      const message = chunk.toString("utf8").trim();
      if (message) this.lastError = message.slice(-500);
    });
    child.on("exit", () => this.failPending("Piko Codex runtime stopped."));
    child.on("error", (error) => this.failPending(error.message));
    await new Promise<void>((resolve, reject) => {
      child.once("spawn", resolve);
      child.once("error", reject);
    }).catch((error: unknown) => {
      throw new AppError({
        code: "PIKO_CODEX_UNAVAILABLE",
        message: `Unable to start ${command.label}: ${error instanceof Error ? error.message : "unknown error"}`,
        statusCode: 503
      });
    });
    await this.request("initialize", {
      clientInfo: { name: "cxshop_piko", title: "CXShop Piko", version: "1.0.57" }
    });
    this.notify("initialized", {});
  }

  private request(method: string, params: unknown) {
    if (!this.process?.stdin.writable)
      return Promise.reject(new Error(this.lastError || "Piko Codex runtime is not writable."));
    const id = this.nextId++;
    const promise = new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { reject, resolve });
      setTimeout(() => {
        const request = this.pending.get(id);
        if (!request) return;
        this.pending.delete(id);
        reject(new Error(`Piko Codex request timed out: ${method}`));
      }, 15_000).unref();
    });
    this.process.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
    return promise;
  }

  private notify(method: string, params: unknown) {
    this.process?.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  private handleLine(line: string) {
    let message: ServerMessage;
    try {
      message = JSON.parse(line) as ServerMessage;
    } catch {
      return;
    }
    if (typeof message.id !== "number") return;
    if (message.method) {
      this.process?.stdin.write(
        `${JSON.stringify({ id: message.id, result: { decision: "decline" } })}\n`
      );
      return;
    }
    const request = this.pending.get(message.id);
    if (!request) return;
    this.pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message || "Codex request failed."));
    else request.resolve(message.result);
  }

  private failPending(message: string) {
    this.lastError = message;
    this.process = null;
    for (const request of this.pending.values()) request.reject(new Error(message));
    this.pending.clear();
  }
}

const clients = new Map<string, PikoCodexClient>();

export function pikoCodexForActor(actor: DevkitActor) {
  const key = `${actor.storageScope}:${actor.id}`;
  const existing = clients.get(key);
  if (existing) return existing;
  const client = new PikoCodexClient(actor);
  clients.set(key, client);
  return client;
}

function actorCodexHome(actor: DevkitActor) {
  const root =
    process.env.CXSHOP_PIKO_CODEX_HOME?.trim() ||
    join(process.env.LOCALAPPDATA?.trim() || process.cwd(), "CXShop", "Piko", "codex");
  return join(root, safeSegment(actor.storageScope), safeSegment(actor.id));
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/gu, "_").slice(0, 120) || "unknown";
}

function resolveCodexCommand() {
  const configured = process.env.CODEX_EXECUTABLE?.trim() || "bundled";
  if (configured === "bundled") {
    const require = createRequire(import.meta.url);
    return {
      args: [require.resolve("@openai/codex/bin/codex.js"), "app-server"],
      executable: process.execPath,
      label: "bundled Codex CLI"
    };
  }
  if (configured.toLowerCase().endsWith(".js"))
    return { args: [configured, "app-server"], executable: process.execPath, label: configured };
  return { args: ["app-server"], executable: configured, label: configured };
}
