export type HoneyProvider = "openai" | "openrouter" | "opencode";
export type HoneyMode = "chat" | "content-writer";
export type HoneyRole = "assistant" | "user";
export type PikoBehavior = "roam" | "stay";

export type PikoMascotSettings = {
  behavior: PikoBehavior;
  xRatio: number;
  yRatio: number;
};

export type HoneyChatInput = {
  message: string;
  mode: HoneyMode;
  threadId?: string | null | undefined;
};

export type HoneyWorkerInput = {
  actorId: string;
  message: string;
  mode: HoneyMode;
  runId: string;
  threadId: string;
};

export type HoneyModelMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};
