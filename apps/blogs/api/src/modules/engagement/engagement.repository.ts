import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";
import type { EngagementInput, EngagementSummary } from "./engagement.types.js";
export class EngagementRepository {
  async articlePublished(id: number) {
    const r =
      await sql`SELECT id FROM blogs_articles WHERE id=${id} AND status='published' LIMIT 1`.execute(
        getBlogsDatabase()
      );
    return Boolean(r.rows[0]);
  }
  async upsert(i: EngagementInput) {
    await sql`INSERT INTO blogs_engagement(uuid,article_id,kind,actor_key,rating,channel)VALUES(${randomBytes(4).toString("hex")},${i.articleId},${i.kind},${i.actorKey},${i.rating},${i.channel}) ON DUPLICATE KEY UPDATE rating=VALUES(rating),channel=VALUES(channel)`.execute(
      getBlogsDatabase()
    );
    return this.summary(i.articleId);
  }
  async summary(articleId: number) {
    const r = await sql<
      Record<string, unknown>
    >`SELECT SUM(kind='like') likes,SUM(kind='star') stars,SUM(kind='share') shares,COALESCE(AVG(CASE WHEN kind='star' THEN rating END),0) average_star FROM blogs_engagement WHERE article_id=${articleId}`.execute(
      getBlogsDatabase()
    );
    const v = r.rows[0] ?? {};
    return {
      articleId,
      likes: Number(v.likes ?? 0),
      stars: Number(v.stars ?? 0),
      shares: Number(v.shares ?? 0),
      averageStar: Number(v.average_star ?? 0)
    } satisfies EngagementSummary;
  }
}
