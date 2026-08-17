import { createHash } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { TenantDatabase } from "../../database/schema.js";
export async function seedTenantUserRoleModule(database: Kysely<TenantDatabase>) {
  const [users, role] = await Promise.all([
    database
      .selectFrom("app_users")
      .select("id")
      .where("role", "=", "admin")
      .where("status", "=", "active")
      .execute(),
    database.selectFrom("app_roles").select("id").where("key", "=", "admin").executeTakeFirst()
  ]);
  if (!role) return;
  for (const user of users) {
    await assignAdminRole(database, user.id, role.id);
  }
}

function assignAdminRole(database: Kysely<TenantDatabase>, userId: number, roleId: number) {
  return sql`INSERT INTO app_user_roles (uuid,user_id,role_id,status,is_protected)
    VALUES (${stable(`user-role:${userId}:${roleId}`)},${userId},${roleId},'active',TRUE)
    ON DUPLICATE KEY UPDATE status='active',is_protected=TRUE`.execute(database);
}

function stable(v: string) {
  return createHash("sha256").update(v).digest("hex").slice(0, 8);
}
