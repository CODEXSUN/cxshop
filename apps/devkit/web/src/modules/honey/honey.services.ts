import { apiGet, apiPost, apiPut } from "../../shared/api/devkit-api";
import type {
  HoneyConnection,
  HoneyConversation,
  HoneyConversationSummary,
  HoneyMode,
  PikoMascotSettings
} from "./honey.types";

export const getHoneyConnection = () => apiGet<HoneyConnection>("/honey/connection");
export const listHoneyConversations = () =>
  apiGet<HoneyConversationSummary[]>("/honey/conversations");
export const getHoneyConversation = (id: string) =>
  apiGet<HoneyConversation>(`/honey/conversations/${id}`);
export const archiveHoneyConversation = (id: string) =>
  apiPut<{ archived: true; id: string }>(`/honey/conversations/${id}/archive`);
export const sendHoneyMessage = (message: string, mode: HoneyMode, threadId: string | null) =>
  apiPost<HoneyConversation>("/honey/chat", { message, mode, threadId });
export const getPikoMascotSettings = () => apiGet<PikoMascotSettings>("/honey/system/mascot");
export const updatePikoMascotSettings = (settings: PikoMascotSettings) =>
  apiPut<PikoMascotSettings>("/honey/system/mascot", settings);
