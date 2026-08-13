import { sql } from "kysely";
import { getEcommerceDatabase } from "../../database/ecommerce-database.js";
import type { StorefrontProfile, StorefrontProfileInput } from "./storefront-profile.types.js";

type Row = {
  about_us: string;
  copyright_text: string;
  instagram_url: string;
  linkedin_url: string;
  powered_by_text: string;
  tagline: string;
  x_url: string;
};

export class StorefrontProfileRepository {
  async get(): Promise<StorefrontProfile | null> {
    const result = await sql<Row>`SELECT tagline,about_us,copyright_text,powered_by_text,
      linkedin_url,instagram_url,x_url FROM ecommerce_storefront_profiles
      WHERE profile_key='default' AND status='active' LIMIT 1`.execute(getEcommerceDatabase());
    return result.rows[0] ? toProfile(result.rows[0]) : null;
  }

  async save(input: StorefrontProfileInput, actorEmail: string) {
    await sql`INSERT INTO ecommerce_storefront_profiles
      (uuid,profile_key,tagline,about_us,copyright_text,powered_by_text,linkedin_url,
       instagram_url,x_url,status,created_by,updated_by)
      VALUES (LOWER(SUBSTRING(MD5('ecommerce:storefront-profile:default'),1,8)),'default',
       ${input.tagline},${input.aboutUs},${input.copyrightText},${input.poweredByText},
       ${input.linkedinUrl},${input.instagramUrl},${input.xUrl},'active',${actorEmail},${actorEmail})
      ON DUPLICATE KEY UPDATE tagline=VALUES(tagline),about_us=VALUES(about_us),
       copyright_text=VALUES(copyright_text),powered_by_text=VALUES(powered_by_text),
       linkedin_url=VALUES(linkedin_url),instagram_url=VALUES(instagram_url),x_url=VALUES(x_url),
       status='active',updated_by=VALUES(updated_by),updated_at=CURRENT_TIMESTAMP`.execute(
      getEcommerceDatabase()
    );
    return this.get();
  }
}

function toProfile(row: Row): StorefrontProfile {
  return {
    aboutUs: row.about_us,
    copyrightText: row.copyright_text,
    instagramUrl: row.instagram_url,
    linkedinUrl: row.linkedin_url,
    poweredByText: row.powered_by_text,
    tagline: row.tagline,
    xUrl: row.x_url
  };
}
