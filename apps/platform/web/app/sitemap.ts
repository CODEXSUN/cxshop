import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const origin = publicOrigin(); return [{ url: origin, lastModified: new Date(), changeFrequency: "daily", priority: 1 }]; }
function publicOrigin(): string { const origin = process.env.PUBLIC_URL; if (!origin) throw new Error("PUBLIC_URL is required"); return origin; }
