import type { EngagementSummary, PublicArticle, PublicDiscussion, PublicTaxonomy } from "./public-blog.types";
type Envelope<T> = { success: boolean; data: T; error?: { message: string } };
async function read<T>(url: string) {
  const response = await fetch(url);
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.error?.message ?? "Blog could not be loaded.");
  return body.data;
}
async function write<T>(url: string, value: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success) throw new Error(body.error?.message ?? "Your request could not be saved.");
  return body.data;
}
export const searchPublicArticles = (search = "") =>
  read<PublicArticle[]>(`/api/platform/public/blog?search=${encodeURIComponent(search)}`);
export const getPublicArticle = (slug: string) =>
  read<PublicArticle>(`/api/platform/public/blog/${encodeURIComponent(slug)}`);
export const getPublicTaxonomy = () => read<PublicTaxonomy[]>("/api/platform/public/blog-taxonomy");
export const getPublicDiscussions = (articleId: number) => read<PublicDiscussion[]>(`/api/platform/public/blog/${articleId}/discussions`);
export const getEngagement = (articleId: number) => read<EngagementSummary>(`/api/platform/public/blog/${articleId}/engagement`);
export const saveDiscussion = (value: Omit<PublicDiscussion, "id" | "uuid" | "status" | "createdAt" | "updatedAt">) => write<PublicDiscussion>("/api/platform/public/blog/discussions", value);
export const saveEngagement = (value: { articleId: number; kind: "like" | "star" | "share"; actorKey: string; rating: number | null; channel: string }) => write<EngagementSummary>("/api/platform/public/blog/engagement", value);
