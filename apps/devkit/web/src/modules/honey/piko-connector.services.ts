import { apiGet, apiPost } from "../../shared/api/devkit-api";
import type { PikoBrowserLogin, PikoCodexStatus, PikoDeviceLogin } from "./piko-connector.types";

export const getPikoCodexStatus = () => apiGet<PikoCodexStatus>("/honey/codex/status");
export const startPikoDeviceLogin = () => apiPost<PikoDeviceLogin>("/honey/codex/device-login");
export const startPikoBrowserLogin = () => apiPost<PikoBrowserLogin>("/honey/codex/browser-login");
export const cancelPikoCodexLogin = (loginId: string) =>
  apiPost<{ cancelled: true }>("/honey/codex/login-cancel", { loginId });
export const logoutPikoCodex = () => apiPost<{ disconnected: true }>("/honey/codex/logout");
