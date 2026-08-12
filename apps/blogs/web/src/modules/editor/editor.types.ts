export type ArticleStatus = "draft" | "published" | "archived";
export type Article = {
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
export type ArticlePayload = Omit<
  Article,
  "id" | "uuid" | "publishedAt" | "createdAt" | "updatedAt"
>;
export type Taxonomy = {
  id: number;
  uuid: string;
  kind: "category" | "tag";
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
