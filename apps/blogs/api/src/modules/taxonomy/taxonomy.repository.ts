import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";
import type { TaxonomyKind, TaxonomyRecord, TaxonomySaveInput } from "./taxonomy.types.js";
type Row = Record<string, unknown> & {
  id: number | string;
  uuid: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
  status: "active" | "inactive";
};
export class TaxonomyRepository {
  async list(kind?: TaxonomyKind) {
    const value = kind ?? "";
    const result =
      await sql<Row>`SELECT * FROM blogs_taxonomy WHERE (${value}='' OR kind=${value}) ORDER BY kind,name`.execute(
        getBlogsDatabase()
      );
    return result.rows.map(toRecord);
  }
  async find(id: number) {
    const result = await sql<Row>`SELECT * FROM blogs_taxonomy WHERE id=${id} LIMIT 1`.execute(
      getBlogsDatabase()
    );
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  }
  async duplicate(kind: TaxonomyKind, slug: string, exceptId = 0) {
    const result =
      await sql`SELECT id FROM blogs_taxonomy WHERE kind=${kind} AND slug=${slug} AND (${exceptId}=0 OR id<>${exceptId}) LIMIT 1`.execute(
        getBlogsDatabase()
      );
    return Boolean(result.rows[0]);
  }
  async create(input: TaxonomySaveInput) {
    const result =
      await sql`INSERT INTO blogs_taxonomy (uuid,kind,name,slug,description,status) VALUES (${randomBytes(4).toString("hex")},${input.kind},${input.name},${input.slug},${input.description},${input.status})`.execute(
        getBlogsDatabase()
      );
    return this.find(Number(result.insertId));
  }
  async update(id: number, input: TaxonomySaveInput) {
    await sql`UPDATE blogs_taxonomy SET kind=${input.kind},name=${input.name},slug=${input.slug},description=${input.description},status=${input.status} WHERE id=${id}`.execute(
      getBlogsDatabase()
    );
    return this.find(id);
  }
}
function toRecord(row: Row): TaxonomyRecord {
  return {
    id: Number(row.id),
    uuid: row.uuid,
    kind: row.kind,
    name: row.name,
    slug: row.slug,
    description: String(row.description ?? ""),
    status: row.status,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString()
  };
}
