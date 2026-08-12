import type { Kysely } from "kysely";
import type { DevkitDatabase } from "../../database/schema.js";

export async function seedHoneyModule(_database: Kysely<DevkitDatabase>) {
  return { module: "devkit.honey", records: 0 };
}
