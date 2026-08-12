export type HoneyMode = "chat" | "content-writer";
export type HoneyConnection = {
  configured: boolean;
  endpoint: string;
  model: string;
  provider: "openai" | "openrouter" | "opencode";
};
export type HoneyMessage = {
  body: string;
  createdAt: string;
  id: string;
  role: "assistant" | "user";
};
export type HoneyRun = {
  createdAt: string;
  error: string | null;
  id: string;
  mode: HoneyMode;
  model: string;
  provider: string;
  status: string;
  steps: Array<{ label: string; role: string }>;
};
export type HoneyConversation = {
  id: string;
  messages: HoneyMessage[];
  runs: HoneyRun[];
  title: string;
};
export type HoneyConversationSummary = { id: string; title: string; updatedAt: string };
