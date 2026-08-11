import type { PublicArticle } from "./public-blog.types";
type Envelope<T> = { success: boolean; data: T; error?: { message: string } };
async function read<T>(url: string) {
  const response = await fetch(url);
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.error?.message ?? "Blog could not be loaded.");
  return body.data;
}
export const searchPublicArticles = (search = "") =>
  read<PublicArticle[]>(`/api/platform/public/blog?search=${encodeURIComponent(search)}`);
export const getPublicArticle = (slug: string) =>
  read<PublicArticle>(`/api/platform/public/blog/${encodeURIComponent(slug)}`);
