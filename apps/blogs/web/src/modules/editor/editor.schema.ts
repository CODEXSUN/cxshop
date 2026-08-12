import { z } from "zod";
export const articleSchema = z
  .object({
    kind: z.enum(["post", "page"]),
    title: z.string().trim().min(1),
    slug: z.string(),
    excerpt: z.string().max(500),
    mdx: z.string().min(1),
    featuredImage: z.string(),
    imageAlt: z.string(),
    authorName: z.string().trim().min(1).max(191),
    authorRole: z.string().max(191),
    authorAvatar: z.string(),
    categoryId: z.number().nullable(),
    tagIds: z.array(z.number()),
    seoTitle: z.string().max(191),
    seoDescription: z.string().max(320),
    canonicalUrl: z.string(),
    status: z.enum(["draft", "published", "archived"])
  })
  .strict();
