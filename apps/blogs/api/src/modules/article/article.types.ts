export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleRecord = {
  id: number;
  uuid: string;
  kind: "post" | "page";
  title: string;
  slug: string;
  excerpt: string;
  mdx: string;
  featuredImage: string;
  imageAlt: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  categoryId: number | null;
  tagIds: number[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ArticleSaveInput = Omit<
  ArticleRecord,
  "id" | "uuid" | "publishedAt" | "createdAt" | "updatedAt"
>;
