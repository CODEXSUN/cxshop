import { apiGet, apiPost, apiPut } from "../../shared/api/platform-api";
import type {
  DataSourceConnectionResult,
  DataSourceProvider,
  DataSourceSettings
} from "./data-source-settings.types";
import type {
  FrappeConnectionPayload,
  FrappeVerificationPayload
} from "./data-source-settings.types";
export const getDataSourceSettings = () =>
  apiGet<DataSourceSettings>("/admin/data-source/settings", "sa");
export const switchDataSourceProvider = (provider: DataSourceProvider) =>
  apiPut<DataSourceSettings>("/admin/data-source/settings/provider", { provider }, "sa");
export const testDataSourceConnection = (provider: DataSourceProvider) =>
  apiPost<DataSourceConnectionResult>(`/admin/data-source/connections/${provider}/test`, {}, "sa");
export const saveFrappeConnection = (payload: FrappeConnectionPayload) =>
  apiPut<DataSourceSettings>("/admin/data-source/frappe", payload, "sa");
export const verifyFrappeConnection = (payload: FrappeVerificationPayload) =>
  apiPost<DataSourceConnectionResult>("/admin/data-source/frappe/verify", payload, "sa");
