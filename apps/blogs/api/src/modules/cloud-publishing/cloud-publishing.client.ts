import { AppError } from "@cxshop/framework/errors";

type Credentials = {
  password: string;
  pullMethod: string;
  publishMethod: string;
  sessionToken: string;
  siteUrl: string;
  user: string;
};

export class FrappeCloudClient {
  constructor(private readonly credentials: Credentials) {}
  async verify() {
    const sessionToken = await this.login();
    const response = await this.request(
      "/api/method/frappe.auth.get_logged_user",
      "GET",
      undefined,
      sessionToken
    );
    return { sessionToken, user: String(response.message ?? this.credentials.user) };
  }
  async publish(method: string, article: Record<string, unknown>) {
    const { payload: response, sessionToken } = await this.authenticatedRequest(
      `/api/method/${method}`,
      "POST",
      { article }
    );
    const result = object(response.message);
    return {
      publicUrl: text(result.public_url ?? result.publicUrl),
      remoteName: text(result.name ?? result.document_name),
      sessionToken
    };
  }
  async pull() {
    const result = await this.authenticatedRequest(
      `/api/method/${this.credentials.pullMethod}`,
      "GET"
    );
    const message = result.payload.message;
    const articles = Array.isArray(message) ? message : object(message).articles;
    if (!Array.isArray(articles))
      throw AppError.conflict("Production pull method did not return an articles list.");
    return { articles: articles.map(object), sessionToken: result.sessionToken };
  }
  private async authenticatedRequest(
    path: string,
    method: "GET" | "POST",
    body?: Record<string, unknown>
  ) {
    let sessionToken = this.credentials.sessionToken || (await this.login());
    try {
      return { payload: await this.request(path, method, body, sessionToken), sessionToken };
    } catch (error) {
      if (!(error instanceof FrappeSessionExpired)) throw error;
      sessionToken = await this.login();
      return { payload: await this.request(path, method, body, sessionToken), sessionToken };
    }
  }
  private async request(
    path: string,
    method: "GET" | "POST",
    body?: Record<string, unknown>,
    sessionToken = ""
  ) {
    const url = new URL(path, `${this.credentials.siteUrl}/`);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (sessionToken) headers.Cookie = sessionToken;
    if (body) headers["Content-Type"] = "application/json";
    const response = await fetch(url, {
      ...(body ? { body: JSON.stringify(body) } : {}),
      headers,
      method,
      signal: AbortSignal.timeout(20_000)
    });
    const payload = await json(response);
    if (response.status === 401 || response.status === 403) throw new FrappeSessionExpired();
    if (!response.ok)
      throw AppError.conflict(
        `Production Frappe returned HTTP ${response.status}: ${message(payload)}`
      );
    return payload;
  }
  private async login() {
    const response = await fetch(new URL("/api/method/login", `${this.credentials.siteUrl}/`), {
      body: JSON.stringify({ pwd: this.credentials.password, usr: this.credentials.user }),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(20_000)
    });
    const payload = await json(response);
    if (!response.ok)
      throw AppError.conflict(`Production Frappe user/password login failed: ${message(payload)}`);
    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";", 1)[0])
      .join("; ");
    if (!cookie.includes("sid="))
      throw AppError.conflict("Production Frappe login did not issue a session token.");
    return cookie;
  }
}
class FrappeSessionExpired extends Error {}
async function json(response: Response) {
  try {
    return object(await response.json());
  } catch {
    return {};
  }
}
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
function message(value: Record<string, unknown>) {
  return text(value.message) || text(value.exception) || "request failed";
}
function text(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
