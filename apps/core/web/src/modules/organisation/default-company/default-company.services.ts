import { requiredClientEnv } from "../../../shared/env/client-env";
import type {
  DefaultCompanyLookup,
  DefaultCompanyRecord,
  DefaultCompanySavePayload
} from "./default-company.types";
const base = requiredClientEnv("VITE_PLATFORM_API_URL");
const path = "/core/organisation/default-company";
type Envelope<T> = { data: T; success: true } | { error: { message: string }; success: false };
async function request<T>(suffix = "", options: RequestInit = {}) {
  const response = await fetch(`${base}${path}${suffix}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Default company request failed." : body.error.message);
  return body.data;
}
export const getDefaultCompany = () => request<DefaultCompanyRecord | null>();
export const saveDefaultCompany = (payload: DefaultCompanySavePayload) =>
  request<DefaultCompanyRecord>("", { method: "PUT", body: JSON.stringify(payload) });
export const listDefaultCompanyLookups = async () => {
  const [companies, financialYears] = await Promise.all([
    request<DefaultCompanyLookup[]>("/company-lookups"),
    request<DefaultCompanyLookup[]>("/financial-year-lookups")
  ]);
  return { companies, financialYears };
};
