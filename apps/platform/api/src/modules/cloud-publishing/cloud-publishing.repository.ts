import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getBlogCloudDatabase as getBlogsDatabase } from "./blog-cloud-database.js";
import { decryptCloudSecret, encryptCloudSecret } from "./cloud-publishing.secrets.js";
import type {
  CloudConnectionInput,
  CloudConnectionView,
  CloudPublishRecord
} from "./cloud-publishing.types.js";

export const cloudArticlePullMethod = "cxshop.api.pull_articles";
export const cloudArticlePublishMethod = "cxshop.api.publish_article";

type Row = Record<string, unknown>;
export class CloudPublishingRepository {
  async connectionRow() {
    return (
      (
        await sql<Row>`SELECT * FROM blogs_cloud_connections ORDER BY id LIMIT 1`.execute(
          getBlogsDatabase()
        )
      ).rows[0] ?? null
    );
  }
  async connection(): Promise<CloudConnectionView> {
    return connectionView(await this.connectionRow());
  }
  async credentials() {
    const row = await this.connectionRow();
    if (!row) return null;
    return {
      enabled: Boolean(row.enabled),
      siteUrl: String(row.site_url),
      user: String(row.user_name ?? ""),
      publishMethod: cloudArticlePublishMethod,
      pullMethod: cloudArticlePullMethod,
      password: secret(row.password_secret),
      sessionToken: secret(row.session_token_secret)
    };
  }
  async saveConnection(input: CloudConnectionInput, actor: string) {
    const current = await this.connectionRow();
    const values = {
      password: input.password?.trim()
        ? encryptCloudSecret(input.password.trim())
        : (current?.password_secret ?? null)
    };
    await sql`INSERT INTO blogs_cloud_connections (uuid,site_url,auth_mode,user_name,password_secret,publish_method,pull_method,enabled,verification_status,updated_by)
      VALUES (${randomBytes(4).toString("hex")},${input.siteUrl},'password',${input.user},${values.password},${cloudArticlePublishMethod},${cloudArticlePullMethod},${input.enabled ? 1 : 0},'unverified',${actor})
      ON DUPLICATE KEY UPDATE site_url=VALUES(site_url),auth_mode='password',user_name=VALUES(user_name),password_secret=VALUES(password_secret),session_token_secret=NULL,publish_method=${cloudArticlePublishMethod},pull_method=${cloudArticlePullMethod},enabled=VALUES(enabled),verification_status='unverified',verified_user=NULL,last_verified_at=NULL,updated_by=VALUES(updated_by)`.execute(
      getBlogsDatabase()
    );
    return this.connection();
  }
  async markVerified(user: string, sessionToken: string) {
    await sql`UPDATE blogs_cloud_connections SET verification_status='live',verified_user=${user},session_token_secret=${encryptCloudSecret(sessionToken)},last_verified_at=CURRENT_TIMESTAMP`.execute(
      getBlogsDatabase()
    );
    return this.connection();
  }
  async saveSessionToken(sessionToken: string) {
    await sql`UPDATE blogs_cloud_connections SET session_token_secret=${encryptCloudSecret(sessionToken)} WHERE singleton_key='production'`.execute(
      getBlogsDatabase()
    );
  }
  async importArticles(articles: Row[]) {
    let created = 0,
      updated = 0;
    for (const article of articles) {
      const slug = String(article.slug ?? "").trim();
      const title = String(article.title ?? "").trim();
      if (!slug || !title) continue;
      const existing = (
        await sql<Row>`SELECT id FROM blogs_articles WHERE slug=${slug} LIMIT 1`.execute(
          getBlogsDatabase()
        )
      ).rows[0];
      const values = cloudArticle(article);
      if (existing) {
        await sql`UPDATE blogs_articles SET kind=${values.kind},title=${title},excerpt=${values.excerpt},mdx=${values.mdx},featured_image=${values.featuredImage},image_alt=${values.imageAlt},author_name=${values.authorName},author_role=${values.authorRole},author_avatar=${values.authorAvatar},seo_title=${values.seoTitle},seo_description=${values.seoDescription},canonical_url=${values.canonicalUrl},status=${values.status},published_at=${values.publishedAt} WHERE id=${Number(existing.id)}`.execute(
          getBlogsDatabase()
        );
        updated += 1;
      } else {
        await sql`INSERT INTO blogs_articles (uuid,kind,title,slug,excerpt,mdx,featured_image,image_alt,author_name,author_role,author_avatar,category_id,tag_ids,seo_title,seo_description,canonical_url,status,published_at) VALUES (${randomBytes(4).toString("hex")},${values.kind},${title},${slug},${values.excerpt},${values.mdx},${values.featuredImage},${values.imageAlt},${values.authorName},${values.authorRole},${values.authorAvatar},NULL,'[]',${values.seoTitle},${values.seoDescription},${values.canonicalUrl},${values.status},${values.publishedAt})`.execute(
          getBlogsDatabase()
        );
        created += 1;
      }
    }
    return { created, updated };
  }
  async article(id: number) {
    return (
      (
        await sql<Row>`SELECT article.*,taxonomy.name AS category_name FROM blogs_articles article LEFT JOIN blogs_taxonomy taxonomy ON taxonomy.id=article.category_id WHERE article.id=${id} LIMIT 1`.execute(
          getBlogsDatabase()
        )
      ).rows[0] ?? null
    );
  }
  async taxonomy(ids: number[]) {
    if (!ids.length) return [];
    return (
      await sql<{
        name: string;
      }>`SELECT name FROM blogs_taxonomy WHERE id IN (${sql.join(ids)}) ORDER BY name`.execute(
        getBlogsDatabase()
      )
    ).rows.map((row) => row.name);
  }
  async createPublication(article: Row, actor: string) {
    const result =
      await sql`INSERT INTO blogs_cloud_publications (uuid,article_id,article_slug,article_title,source_updated_at,requested_by) VALUES (${randomBytes(4).toString("hex")},${Number(article.id)},${String(article.slug)},${String(article.title)},${new Date(article.updated_at as string)},${actor})`.execute(
        getBlogsDatabase()
      );
    return this.findPublication(Number(result.insertId));
  }
  async listPublications() {
    const result =
      await sql<Row>`SELECT * FROM blogs_cloud_publications ORDER BY created_at DESC`.execute(
        getBlogsDatabase()
      );
    return result.rows.map(toPublication);
  }
  async findPublication(id: number) {
    const row = (
      await sql<Row>`SELECT * FROM blogs_cloud_publications WHERE id=${id} LIMIT 1`.execute(
        getBlogsDatabase()
      )
    ).rows[0];
    return row ? toPublication(row) : null;
  }
  async markRunning(id: number) {
    await sql`UPDATE blogs_cloud_publications SET status='running',attempts=attempts+1,error_message=NULL WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
  }
  async markCompleted(id: number, remoteName: string | null, publicUrl: string | null) {
    await sql`UPDATE blogs_cloud_publications SET status='completed',remote_document_name=${remoteName},public_url=${publicUrl},completed_at=CURRENT_TIMESTAMP,error_message=NULL WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
    return this.findPublication(id);
  }
  async markFailed(id: number, message: string) {
    await sql`UPDATE blogs_cloud_publications SET status='failed',error_message=${message.slice(0, 4000)} WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
  }
}
function secret(value: unknown) {
  return value ? decryptCloudSecret(String(value)) : "";
}
function date(value: unknown) {
  return value ? new Date(value as string).toISOString() : null;
}
function connectionView(row: Row | null): CloudConnectionView {
  return {
    enabled: Boolean(row?.enabled),
    lastVerifiedAt: date(row?.last_verified_at),
    passwordConfigured: Boolean(row?.password_secret),
    siteUrl: String(row?.site_url ?? ""),
    updatedAt: date(row?.updated_at),
    updatedBy: row?.updated_by ? String(row.updated_by) : null,
    user: String(row?.user_name ?? ""),
    verificationStatus: row?.verification_status === "live" ? "live" : "unverified",
    verifiedUser: row?.verified_user ? String(row.verified_user) : null,
    transactionTokenConfigured: Boolean(row?.session_token_secret)
  };
}
function cloudArticle(row: Row) {
  const status = ["draft", "published", "archived"].includes(String(row.status))
    ? String(row.status)
    : "draft";
  return {
    authorAvatar: String(row.author_avatar ?? ""),
    authorName: String(row.author_name ?? "Editorial Team"),
    authorRole: String(row.author_role ?? "Technology Editor"),
    canonicalUrl: String(row.canonical_url ?? ""),
    excerpt: String(row.excerpt ?? ""),
    featuredImage: String(row.featured_image ?? ""),
    imageAlt: String(row.image_alt ?? ""),
    kind: row.kind === "page" ? "page" : "post",
    mdx: String(row.mdx ?? ""),
    publishedAt: row.published_at ? new Date(row.published_at as string) : null,
    seoDescription: String(row.seo_description ?? ""),
    seoTitle: String(row.seo_title ?? ""),
    status
  };
}
function toPublication(row: Row): CloudPublishRecord {
  return {
    articleId: Number(row.article_id),
    articleSlug: String(row.article_slug),
    articleTitle: String(row.article_title),
    attempts: Number(row.attempts),
    completedAt: date(row.completed_at),
    createdAt: date(row.created_at) ?? "",
    errorMessage: row.error_message ? String(row.error_message) : null,
    id: Number(row.id),
    publicUrl: row.public_url ? String(row.public_url) : null,
    remoteDocumentName: row.remote_document_name ? String(row.remote_document_name) : null,
    requestedBy: String(row.requested_by),
    sourceUpdatedAt: date(row.source_updated_at) ?? "",
    status: String(row.status) as CloudPublishRecord["status"],
    updatedAt: date(row.updated_at) ?? "",
    uuid: String(row.uuid)
  };
}
