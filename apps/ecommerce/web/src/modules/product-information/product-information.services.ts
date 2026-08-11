import type {
  CoreBrandOption,
  CoreProductOption,
  ProductInformationPayload,
  ProductInformationRecord,
  PublicationStatus
} from "./product-information.types";
type Envelope<T> = { data: T; success: true } | { error: { message: string }; success: false };
const base = "/api/platform/ecommerce/catalog/product-information";

async function request<T>(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Ecommerce request failed." : body.error.message);
  return body.data;
}
export const listProductInformation = (search = "", status?: PublicationStatus) =>
  request<ProductInformationRecord[]>(
    `${base}?search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`
  );
export const listCoreProductOptions = () => request<CoreProductOption[]>(`${base}/core-products`);
export const listCoreBrandOptions = () => request<CoreBrandOption[]>(`${base}/core-brands`);
export const createProductInformation = (payload: ProductInformationPayload) =>
  request<ProductInformationRecord>(base, { body: JSON.stringify(payload), method: "POST" });
export const updateProductInformation = (id: number, payload: ProductInformationPayload) =>
  request<ProductInformationRecord>(`${base}/${id}`, {
    body: JSON.stringify(payload),
    method: "PUT"
  });
export const archiveProductInformation = (id: number) =>
  request<ProductInformationRecord>(`${base}/${id}/archive`, { body: "{}", method: "POST" });
