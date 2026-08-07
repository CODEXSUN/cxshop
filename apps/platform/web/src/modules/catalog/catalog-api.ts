import type { CategoryDto, ProductDetailDto, ProductSummaryDto } from "@cxshop/contracts";

const apiUrl = process.env.API_URL;

export async function getCategories(): Promise<CategoryDto[]> {
  return getList<CategoryDto>("/v1/store/categories");
}

export async function getProducts(category?: string): Promise<ProductSummaryDto[]> {
  return getList<ProductSummaryDto>(`/v1/store/products${category ? `?category=${encodeURIComponent(category)}` : ""}`);
}

export async function getProduct(slug: string): Promise<ProductDetailDto | undefined> {
  const response = await request(`/v1/store/products/${encodeURIComponent(slug)}`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error("Catalog is unavailable");
  return response.json() as Promise<ProductDetailDto>;
}

async function getList<T>(path: string): Promise<T[]> {
  const response = await request(path);
  if (!response.ok) throw new Error("Catalog is unavailable");
  return ((await response.json()) as { items: T[] }).items;
}

function request(path: string): Promise<Response> {
  if (!apiUrl) throw new Error("API_URL is required");
  return fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } });
}
