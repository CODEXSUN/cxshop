import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "../src/modules/catalog/catalog-api";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicOrigin();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return [
    { url: origin, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...categories.map(category => ({ url: `${origin}/categories/${category.slug}`, changeFrequency: "weekly" as const, priority: .8 })),
    ...products.map(product => ({ url: `${origin}/products/${product.slug}`, changeFrequency: "weekly" as const, priority: .7 }))
  ];
}
function publicOrigin(): string { const origin = process.env.PUBLIC_URL; if (!origin) throw new Error("PUBLIC_URL is required"); return origin; }
