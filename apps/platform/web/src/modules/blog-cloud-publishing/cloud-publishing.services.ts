import type {
  CloudConnection,
  CloudConnectionPayload,
  CloudPullResult,
  CloudPublication,
  PublishableArticle
} from "./cloud-publishing.types";
type Envelope<T> = { data: T; success: true } | { error: { message: string }; success: false };
const base = "/api/platform/blogs/cloud-publishing";
const connectionBase = "/api/platform/application/site-connection";
async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Cloud publishing request failed." : body.error.message);
  return body.data;
}
export const getCloudConnection = () => request<CloudConnection>(connectionBase);
export const saveCloudConnection = (value: CloudConnectionPayload) =>
  request<CloudConnection>(connectionBase, { body: JSON.stringify(value), method: "PUT" });
export const verifyCloudConnection = () =>
  request<CloudConnection>(`${connectionBase}/verify`, { body: "{}", method: "POST" });
export const pullArticlesFromCloud = () =>
  request<CloudPullResult>(`${base}/pull`, { body: "{}", method: "POST" });
export const listCloudPublications = () => request<CloudPublication[]>(`${base}/publications`);
export const listPublishableArticles = () =>
  request<PublishableArticle[]>("/api/platform/blogs/articles");
export const publishArticleToCloud = (articleId: number) =>
  request<CloudPublication>(`${base}/articles/${articleId}/publish`, {
    body: "{}",
    method: "POST"
  });
