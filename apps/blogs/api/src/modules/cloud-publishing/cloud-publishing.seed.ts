import type { Kysely } from "kysely";
import type { BlogsDatabase } from "../../database/blogs-database.js";
export async function seedCloudPublishingModule(_database: Kysely<BlogsDatabase>) {
  /* Production connections are never seeded. */
}
