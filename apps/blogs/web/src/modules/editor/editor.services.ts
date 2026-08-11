import type { Article, ArticlePayload, Taxonomy } from "./editor.types";
type Envelope<T> = { success: boolean; data: T; error?: { message: string } };
async function request<T>(url: string, init?: RequestInit) {
  const r = await fetch(url, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
    ...init
  });
  const body = (await r.json()) as Envelope<T>;
  if (!r.ok || !body.success) throw new Error(body.error?.message ?? "Blog request failed.");
  return body.data;
}
export const listArticles = () => request<Article[]>("/api/platform/blogs/articles");
export const listTaxonomy = () => request<Taxonomy[]>("/api/platform/blogs/taxonomy");
export const createArticle = (body: ArticlePayload) =>
  request<Article>("/api/platform/blogs/articles", { method: "POST", body: JSON.stringify(body) });
export const updateArticle = (id: number, body: ArticlePayload) =>
  request<Article>(`/api/platform/blogs/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
