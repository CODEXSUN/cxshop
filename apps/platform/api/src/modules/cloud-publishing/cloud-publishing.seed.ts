import type { Kysely } from "kysely";
import type { BlogCloudDatabase } from "./blog-cloud-database.js";
export async function seedCloudPublishingModule(_database: Kysely<BlogCloudDatabase>) {
  /* Production connections are never seeded. */
}
