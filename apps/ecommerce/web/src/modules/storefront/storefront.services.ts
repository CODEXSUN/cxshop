import type {
  StorefrontCategory,
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontProductDetail
} from "./storefront.types";
import type { StorefrontBlogPost } from "./storefront.types";
import type { StorefrontSiteNavigation } from "./storefront.types";
type Envelope<T> = { data: T; success: true } | { error: { message: string }; success: false };
async function get<T>(path: string) {
  const response = await fetch(`/api/platform${path}`, { headers: { Accept: "application/json" } });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Store request failed." : body.error.message);
  return body.data;
}
export const listStorefrontProducts = (filters: StorefrontFilters) => {
  const query = new URLSearchParams({
    brand: filters.brand,
    category: filters.category,
    scope: filters.scope,
    search: filters.search,
    sort: filters.sort
  });
  if (filters.minPrice != null) query.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) query.set("maxPrice", String(filters.maxPrice));
  return get<StorefrontProduct[]>(`/storefront/catalog?${query}`);
};
export const listStorefrontCategories = () => get<StorefrontCategory[]>("/storefront/categories");
export const getStorefrontDiscovery = () => get<StorefrontDiscovery>("/storefront/discovery");
export const getStorefrontProduct = (slug: string) =>
  get<StorefrontProductDetail>(`/storefront/products/${encodeURIComponent(slug)}`);
export const listLatestBlogPosts = () => get<StorefrontBlogPost[]>("/public/blog?kind=post");
export const getStorefrontSiteNavigation = () =>
  get<StorefrontSiteNavigation>("/storefront/site-navigation");
