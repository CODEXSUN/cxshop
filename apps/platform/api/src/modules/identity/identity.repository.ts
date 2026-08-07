import type { Portal, SessionDto } from "@cxshop/contracts";
import type { DatabaseConnection } from "@cxshop/framework";

export type LoginIdentity = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  portal: Portal;
  permissions: string[];
  vendorId?: string;
};

export class IdentityRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async findForLogin(email: string, portal: Portal): Promise<LoginIdentity | undefined> {
    const row = await this.database
      .selectFrom("cxshop_users as user")
      .innerJoin("cxshop_portal_access as access", join => join
        .onRef("access.user_id", "=", "user.id")
        .on("access.portal", "=", portal)
        .on("access.active", "=", true))
      .leftJoin("cxshop_vendor_memberships as membership", join => join
        .onRef("membership.user_id", "=", "user.id")
        .on("membership.active", "=", true))
      .select([
        "user.public_id as id", "user.email", "user.display_name as displayName",
        "user.password_hash as passwordHash", "access.portal", "access.permissions",
        "membership.vendor_public_id as vendorId"
      ])
      .where("user.email", "=", email.toLowerCase())
      .where("user.active", "=", true)
      .executeTakeFirst();

    if (!row) return undefined;
    const { vendorId, ...identity } = row;
    return {
      ...identity,
      portal: row.portal as Portal,
      permissions: JSON.parse(row.permissions) as string[],
      ...(vendorId ? { vendorId } : {})
    };
  }

  toSession(identity: LoginIdentity): SessionDto {
    return {
      actorId: identity.id,
      email: identity.email,
      displayName: identity.displayName,
      portal: identity.portal,
      permissions: identity.permissions,
      ...(identity.vendorId ? { vendorId: identity.vendorId } : {})
    };
  }
}
