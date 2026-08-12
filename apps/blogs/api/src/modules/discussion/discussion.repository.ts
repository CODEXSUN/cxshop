import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";
import type { DiscussionRecord, DiscussionSaveInput } from "./discussion.types.js";
type Row = Record<string, unknown> & {
  id: number | string;
  uuid: string;
  article_id: number | string;
  kind: "comment" | "review";
  author_name: string;
  author_email: string;
  body: string;
  rating: number | string | null;
  status: "pending" | "approved" | "rejected";
};
export class DiscussionRepository {
  async list(articleId?: number, publicOnly = false) {
    const id = articleId ?? 0;
    const r =
      await sql<Row>`SELECT * FROM blogs_discussions WHERE (${id}=0 OR article_id=${id}) AND (${publicOnly ? 1 : 0}=0 OR status='approved') ORDER BY created_at DESC`.execute(
        getBlogsDatabase()
      );
    return r.rows.map(toRecord);
  }
  async articlePublished(id: number) {
    const r =
      await sql`SELECT id FROM blogs_articles WHERE id=${id} AND status='published' LIMIT 1`.execute(
        getBlogsDatabase()
      );
    return Boolean(r.rows[0]);
  }
  async create(i: DiscussionSaveInput) {
    const r =
      await sql`INSERT INTO blogs_discussions(uuid,article_id,parent_id,kind,author_name,author_email,body,rating)VALUES(${randomBytes(4).toString("hex")},${i.articleId},${i.parentId},${i.kind},${i.authorName},${i.authorEmail},${i.body},${i.rating})`.execute(
        getBlogsDatabase()
      );
    return this.find(Number(r.insertId));
  }
  async find(id: number) {
    const r = await sql<Row>`SELECT * FROM blogs_discussions WHERE id=${id} LIMIT 1`.execute(
      getBlogsDatabase()
    );
    return r.rows[0] ? toRecord(r.rows[0]) : null;
  }
  async moderate(id: number, status: "approved" | "rejected") {
    await sql`UPDATE blogs_discussions SET status=${status} WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
    return this.find(id);
  }
}
function toRecord(r: Row): DiscussionRecord {
  return {
    id: Number(r.id),
    uuid: r.uuid,
    articleId: Number(r.article_id),
    parentId: r.parent_id == null ? null : Number(r.parent_id),
    kind: r.kind,
    authorName: r.author_name,
    authorEmail: r.author_email,
    body: r.body,
    rating: r.rating == null ? null : Number(r.rating),
    status: r.status,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString()
  };
}
