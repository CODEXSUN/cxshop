import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";
import type { ArticleRecord, ArticleSaveInput } from "./article.types.js";
type Row = Record<string, unknown> & {
  id: number | string;
  uuid: string;
  kind: "post" | "page";
  title: string;
  slug: string;
  mdx: string;
  status: "draft" | "published" | "archived";
};
export class ArticleRepository {
  async list(input: { publicOnly?: boolean; search?: string; kind?: "post" | "page" } = {}) {
    const search = input.search?.trim() ?? "",
      kind = input.kind ?? "";
    const result =
      await sql<Row>`SELECT * FROM blogs_articles WHERE (${kind}='' OR kind=${kind}) AND (${input.publicOnly ? 1 : 0}=0 OR status='published') AND (${search}='' OR MATCH(title,excerpt,mdx) AGAINST (${search} IN NATURAL LANGUAGE MODE)) ORDER BY COALESCE(published_at,created_at) DESC`.execute(
        getBlogsDatabase()
      );
    return result.rows.map(toRecord);
  }
  async findBySlug(slug: string, publicOnly = false) {
    const result =
      await sql<Row>`SELECT * FROM blogs_articles WHERE slug=${slug} AND (${publicOnly ? 1 : 0}=0 OR status='published') LIMIT 1`.execute(
        getBlogsDatabase()
      );
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  }
  async find(id: number) {
    const result = await sql<Row>`SELECT * FROM blogs_articles WHERE id=${id} LIMIT 1`.execute(
      getBlogsDatabase()
    );
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  }
  async duplicate(slug: string, exceptId = 0) {
    const result =
      await sql`SELECT id FROM blogs_articles WHERE slug=${slug} AND (${exceptId}=0 OR id<>${exceptId}) LIMIT 1`.execute(
        getBlogsDatabase()
      );
    return Boolean(result.rows[0]);
  }
  async taxonomyValid(categoryId: number | null, tagIds: number[]) {
    const ids = [...(categoryId ? [categoryId] : []), ...tagIds];
    if (!ids.length) return true;
    const result = await sql<{
      id: number | string;
    }>`SELECT id FROM blogs_taxonomy WHERE id IN (${sql.join(ids)}) AND status='active'`.execute(
      getBlogsDatabase()
    );
    return new Set(result.rows.map((r) => Number(r.id))).size === new Set(ids).size;
  }
  async create(input: ArticleSaveInput) {
    const result =
      await sql`INSERT INTO blogs_articles (uuid,kind,title,slug,excerpt,mdx,featured_image,image_alt,author_name,author_role,author_avatar,category_id,tag_ids,seo_title,seo_description,canonical_url,status,published_at) VALUES (${randomBytes(4).toString("hex")},${input.kind},${input.title},${input.slug},${input.excerpt},${input.mdx},${input.featuredImage},${input.imageAlt},${input.authorName},${input.authorRole},${input.authorAvatar},${input.categoryId},${JSON.stringify(input.tagIds)},${input.seoTitle},${input.seoDescription},${input.canonicalUrl},${input.status},${input.status === "published" ? new Date() : null})`.execute(
        getBlogsDatabase()
      );
    return this.find(Number(result.insertId));
  }
  async update(id: number, input: ArticleSaveInput) {
    await sql`UPDATE blogs_articles SET kind=${input.kind},title=${input.title},slug=${input.slug},excerpt=${input.excerpt},mdx=${input.mdx},featured_image=${input.featuredImage},image_alt=${input.imageAlt},author_name=${input.authorName},author_role=${input.authorRole},author_avatar=${input.authorAvatar},category_id=${input.categoryId},tag_ids=${JSON.stringify(input.tagIds)},seo_title=${input.seoTitle},seo_description=${input.seoDescription},canonical_url=${input.canonicalUrl},status=${input.status},published_at=CASE WHEN ${input.status}='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE published_at END WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
    return this.find(id);
  }
}
function toRecord(r: Row): ArticleRecord {
  return {
    id: Number(r.id),
    uuid: r.uuid,
    kind: r.kind,
    title: r.title,
    slug: r.slug,
    excerpt: String(r.excerpt ?? ""),
    mdx: r.mdx,
    featuredImage: String(r.featured_image ?? ""),
    imageAlt: String(r.image_alt ?? ""),
    authorName: String(r.author_name ?? "Editorial Team"),
    authorRole: String(r.author_role ?? "Technology Editor"),
    authorAvatar: String(r.author_avatar ?? ""),
    categoryId: r.category_id == null ? null : Number(r.category_id),
    tagIds: Array.isArray(r.tag_ids)
      ? r.tag_ids.map(Number)
      : (JSON.parse(String(r.tag_ids ?? "[]")) as number[]),
    seoTitle: String(r.seo_title ?? ""),
    seoDescription: String(r.seo_description ?? ""),
    canonicalUrl: String(r.canonical_url ?? ""),
    status: r.status,
    publishedAt: r.published_at ? new Date(r.published_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString()
  };
}
