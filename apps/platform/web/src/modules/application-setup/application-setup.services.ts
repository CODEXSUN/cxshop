import { apiGet } from "../../shared/api/platform-api";
import type { ApplicationSetupRuntime } from "./application-setup.types";

export function getApplicationSetup() {
  return apiGet<ApplicationSetupRuntime>("/application/setup", "tenant");
}
