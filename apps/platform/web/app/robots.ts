import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const origin = publicOrigin(); return { rules: { userAgent: "*", allow: "/", disallow: ["/account", "/vendor", "/admin", "/sa"] }, sitemap: `${origin}/sitemap.xml` }; }
function publicOrigin(): string { const origin = process.env.PUBLIC_URL; if (!origin) throw new Error("PUBLIC_URL is required"); return origin; }
