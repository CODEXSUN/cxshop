import { Kysely, MysqlDialect } from "kysely";
import { createPool, type PoolOptions } from "mysql2";
import { createConnection } from "mysql2/promise";
import {
  rollbackMigrationBatch,
  runMigrationBatch,
  type MigrationBatch
} from "@cxshop/framework/db";
import { ecommerceEnv as env } from "../env.js";
import {
  migrateProductInformationModule,
  productInformationMigration
} from "../modules/product-information/product-information.migration.js";
import { seedProductInformationModule } from "../modules/product-information/product-information.seed.js";
import {
  migrateProductVariantModule,
  productVariantMigration
} from "../modules/product-variant/product-variant.migration.js";
import { seedProductVariantModule } from "../modules/product-variant/product-variant.seed.js";
import {
  migrateProductImageModule,
  productImageMigration
} from "../modules/product-image/product-image.migration.js";
import { seedProductImageModule } from "../modules/product-image/product-image.seed.js";
import {
  productInformationDetailsMigration,
  upgradeProductInformationDetails
} from "../modules/product-information/product-information.migration.js";
import {
  catalogMatchingMigration,
  catalogMatchingUuidWidthMigration,
  migrateCatalogMatchingModule,
  upgradeCatalogMatchingUuidWidth
} from "../modules/catalog-matching/catalog-matching.migration.js";
import { seedCatalogMatchingModule } from "../modules/catalog-matching/catalog-matching.seed.js";
import {
  migrateStorefrontAnnouncementModule,
  storefrontAnnouncementMigration
} from "../modules/storefront-announcement/storefront-announcement.migration.js";
import { seedStorefrontAnnouncementModule } from "../modules/storefront-announcement/storefront-announcement.seed.js";
import {
  migrateStorefrontProfileModule,
  storefrontProfileMigration,
  storefrontProfileSocialLinksMigration,
  storefrontProfileUxContentMigration,
  upgradeStorefrontProfileSocialLinks,
  upgradeStorefrontProfileUxContent
} from "../modules/storefront-profile/storefront-profile.migration.js";
import { seedStorefrontProfileModule } from "../modules/storefront-profile/storefront-profile.seed.js";
import {
  catalogDataSourceCompatibilityMigration,
  catalogDataSourceSeedCompatibilityMigration,
  catalogStorefrontSourceCompatibilityMigration,
  catalogStorefrontErpnextLinksMigration,
  catalogStorefrontSliderMigration,
  catalogStorefrontUxSourceMigration,
  catalogModuleDataSourceMigration,
  catalogDataSourceAuditMigration,
  catalogDataSourceSyncMigration,
  migrateCatalogModuleDataSources,
  migrateCatalogDataSourceSync,
  upgradeCatalogDataSourceAudit,
  upgradeCatalogDataSourceCompatibility,
  upgradeCatalogDataSourceSeedCompatibility,
  upgradeCatalogStorefrontSourceCompatibility,
  upgradeCatalogStorefrontErpnextLinks,
  upgradeCatalogStorefrontSlider,
  upgradeCatalogStorefrontUxSources
} from "../modules/catalog-data-source/catalog-data-source.migration.js";
import {
  migrateStorefrontSliderModule,
  storefrontSliderMigration
} from "../modules/storefront-slider/storefront-slider.migration.js";
import {
  migratePromotionCardModule,
  promotionCardBadgeTextColorMigration,
  promotionCardMigration,
  upgradePromotionCardBadgeTextColor
} from "../modules/promotion-card/promotion-card.migration.js";
import {
  featuredCardMigration,
  migrateFeaturedCardModule
} from "../modules/featured-card/featured-card.migration.js";
import {
  storefrontPerformanceMigration,
  upgradeStorefrontReadPerformance
} from "../modules/storefront/storefront-performance.migration.js";
import {
  standardizeStorefrontSchema,
  storefrontSchemaStandardizationMigration
} from "../modules/storefront/storefront-schema.migration.js";

export type EcommerceDatabase = Record<string, unknown>;
type ConnectionOptions = {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
};
type ConnectionEntry = { database: Kysely<EcommerceDatabase>; lastUsedAt: number };

const connections = new Map<string, ConnectionEntry>();
const migrated = new Set<string>();

export const ecommerceTenantMigrations = [
  productInformationMigration,
  productInformationDetailsMigration,
  productVariantMigration,
  productImageMigration,
  catalogMatchingMigration,
  catalogMatchingUuidWidthMigration,
  storefrontAnnouncementMigration,
  catalogDataSourceSyncMigration,
  catalogDataSourceAuditMigration,
  catalogModuleDataSourceMigration,
  catalogDataSourceCompatibilityMigration,
  catalogDataSourceSeedCompatibilityMigration,
  catalogStorefrontSliderMigration,
  storefrontSliderMigration,
  promotionCardMigration,
  promotionCardBadgeTextColorMigration,
  featuredCardMigration,
  catalogStorefrontSourceCompatibilityMigration,
  storefrontProfileMigration,
  storefrontProfileSocialLinksMigration,
  storefrontProfileUxContentMigration,
  storefrontPerformanceMigration,
  catalogStorefrontUxSourceMigration
] as const;
export const ecommerceMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 1,
  description: "Ecommerce catalog schema baseline.",
  scope: "ecommerce",
  version: "1.0.55",
  steps: [
    {
      checksum: `${productInformationMigration.key}:v1`,
      description: productInformationMigration.description,
      name: productInformationMigration.key,
      up: migrateProductInformationModule,
      version: 1
    },
    {
      checksum: `${productInformationDetailsMigration.key}:v2`,
      description: productInformationDetailsMigration.description,
      name: productInformationDetailsMigration.key,
      up: upgradeProductInformationDetails,
      version: 2
    },
    {
      checksum: `${productVariantMigration.key}:v1`,
      description: productVariantMigration.description,
      name: productVariantMigration.key,
      up: migrateProductVariantModule,
      version: 1
    },
    {
      checksum: `${productImageMigration.key}:v1`,
      description: productImageMigration.description,
      name: productImageMigration.key,
      up: migrateProductImageModule,
      version: 1
    },
    {
      checksum: `${catalogMatchingMigration.key}:v1`,
      description: catalogMatchingMigration.description,
      name: catalogMatchingMigration.key,
      up: migrateCatalogMatchingModule,
      version: 1
    },
    {
      checksum: `${catalogMatchingUuidWidthMigration.key}:v2`,
      description: catalogMatchingUuidWidthMigration.description,
      name: catalogMatchingUuidWidthMigration.key,
      up: upgradeCatalogMatchingUuidWidth,
      version: 2
    }
  ]
};
const ecommerceStorefrontMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 2,
  description: "Ecommerce storefront announcement events.",
  scope: "ecommerce",
  version: "1.0.56",
  steps: [
    {
      checksum: `${storefrontAnnouncementMigration.key}:v1`,
      description: storefrontAnnouncementMigration.description,
      name: storefrontAnnouncementMigration.key,
      up: migrateStorefrontAnnouncementModule,
      version: 1
    }
  ]
};
const ecommerceCatalogSyncMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 3,
  description: "Ecommerce Frappe catalog synchronization.",
  scope: "ecommerce",
  version: "1.0.57",
  steps: [
    {
      checksum: `${catalogDataSourceSyncMigration.key}:v1`,
      description: catalogDataSourceSyncMigration.description,
      name: catalogDataSourceSyncMigration.key,
      up: migrateCatalogDataSourceSync,
      version: 1
    }
  ]
};
const ecommerceCatalogSyncAuditMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 4,
  description: "Ecommerce catalog synchronization audit fields.",
  scope: "ecommerce",
  version: "1.0.57",
  steps: [
    {
      checksum: `${catalogDataSourceAuditMigration.key}:v1`,
      description: catalogDataSourceAuditMigration.description,
      name: catalogDataSourceAuditMigration.key,
      up: upgradeCatalogDataSourceAudit,
      version: 1
    }
  ]
};
const ecommerceModuleDataSourceMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 5,
  description: "Per-module Ecommerce read-source preferences.",
  scope: "ecommerce",
  version: "1.0.57",
  steps: [
    {
      checksum: `${catalogModuleDataSourceMigration.key}:v1`,
      description: catalogModuleDataSourceMigration.description,
      name: catalogModuleDataSourceMigration.key,
      up: migrateCatalogModuleDataSources,
      version: 1
    }
  ]
};
const ecommerceStorefrontProfileMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 6,
  description: "White-label storefront profile settings.",
  scope: "ecommerce",
  version: "1.0.58",
  steps: [
    {
      checksum: `${storefrontProfileMigration.key}:v1`,
      description: storefrontProfileMigration.description,
      name: storefrontProfileMigration.key,
      up: migrateStorefrontProfileModule,
      version: 1
    }
  ]
};
const ecommerceCatalogCompatibilityMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 7,
  description: "Frappe-compatible local catalog cache fields.",
  scope: "ecommerce",
  version: "1.0.59",
  steps: [
    {
      checksum: `${catalogDataSourceCompatibilityMigration.key}:v1`,
      description: catalogDataSourceCompatibilityMigration.description,
      name: catalogDataSourceCompatibilityMigration.key,
      up: upgradeCatalogDataSourceCompatibility,
      version: 1
    }
  ]
};
const ecommerceCatalogSeedCompatibilityMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 8,
  description: "Local and Frappe catalog seed compatibility.",
  scope: "ecommerce",
  version: "1.0.59",
  steps: [
    {
      checksum: `${catalogDataSourceSeedCompatibilityMigration.key}:v1`,
      description: catalogDataSourceSeedCompatibilityMigration.description,
      name: catalogDataSourceSeedCompatibilityMigration.key,
      up: upgradeCatalogDataSourceSeedCompatibility,
      version: 1
    }
  ]
};
const ecommerceCatalogStorefrontSliderMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 9,
  description: "LogicX iShop storefront slider catalog selection.",
  scope: "ecommerce",
  version: "1.0.64",
  steps: [
    {
      checksum: `${catalogStorefrontSliderMigration.key}:v1`,
      description: catalogStorefrontSliderMigration.description,
      name: catalogStorefrontSliderMigration.key,
      up: upgradeCatalogStorefrontSlider,
      version: 1
    }
  ]
};
const ecommerceStorefrontSliderDocumentMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 10,
  description: "Dedicated LogicX iShop Slider document cache.",
  scope: "ecommerce",
  version: "1.0.64",
  steps: [
    {
      checksum: `${storefrontSliderMigration.key}:v1`,
      description: storefrontSliderMigration.description,
      name: storefrontSliderMigration.key,
      up: migrateStorefrontSliderModule,
      version: 1
    }
  ]
};
const ecommercePromotionCardMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 11,
  description: "Dedicated LogicX iShop Promotion Card document cache.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${promotionCardMigration.key}:v1`,
      description: promotionCardMigration.description,
      name: promotionCardMigration.key,
      up: migratePromotionCardModule,
      version: 1
    }
  ]
};
const ecommerceStorefrontSourceCompatibilityMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 12,
  description: "Local-first storefront content source preferences.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${catalogStorefrontSourceCompatibilityMigration.key}:v1`,
      description: catalogStorefrontSourceCompatibilityMigration.description,
      name: catalogStorefrontSourceCompatibilityMigration.key,
      up: upgradeCatalogStorefrontSourceCompatibility,
      version: 1
    }
  ]
};
const ecommercePromotionBadgeColorMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 13,
  description: "Editable promotion badge foreground colour.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${promotionCardBadgeTextColorMigration.key}:v1`,
      description: promotionCardBadgeTextColorMigration.description,
      name: promotionCardBadgeTextColorMigration.key,
      up: upgradePromotionCardBadgeTextColor,
      version: 1
    }
  ]
};
const ecommerceFeaturedCardMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 14,
  description: "Dedicated LogicX iShop Featured Card document cache.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${featuredCardMigration.key}:v1`,
      description: featuredCardMigration.description,
      name: featuredCardMigration.key,
      up: migrateFeaturedCardModule,
      version: 1
    }
  ]
};
const ecommerceStorefrontProfileSocialLinksMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 15,
  description: "Additional storefront social profile links.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${storefrontProfileSocialLinksMigration.key}:v1`,
      description: storefrontProfileSocialLinksMigration.description,
      name: storefrontProfileSocialLinksMigration.key,
      up: upgradeStorefrontProfileSocialLinks,
      version: 1
    }
  ]
};
const ecommerceStorefrontProfileUxContentMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 16,
  description: "Editable StoreFront UX content.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${storefrontProfileUxContentMigration.key}:v1`,
      description: storefrontProfileUxContentMigration.description,
      name: storefrontProfileUxContentMigration.key,
      up: upgradeStorefrontProfileUxContent,
      version: 1
    }
  ]
};
const ecommerceStorefrontPerformanceMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 17,
  description: "Published storefront read-path indexes.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${storefrontPerformanceMigration.key}:v1`,
      description: storefrontPerformanceMigration.description,
      name: storefrontPerformanceMigration.key,
      up: upgradeStorefrontReadPerformance,
      version: 1
    }
  ]
};
const ecommerceStorefrontSchemaMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 18,
  description: "Storefront schema ownership and audit standardization.",
  scope: "ecommerce",
  version: "1.0.66",
  steps: [
    {
      checksum: `${storefrontSchemaStandardizationMigration.key}:v1`,
      description: storefrontSchemaStandardizationMigration.description,
      name: storefrontSchemaStandardizationMigration.key,
      up: standardizeStorefrontSchema,
      version: 1
    }
  ]
};
const ecommerceStorefrontUxSourceMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 19,
  description: "Storefront UX data-source preferences.",
  scope: "ecommerce",
  version: "1.0.67",
  steps: [
    {
      checksum: `${catalogStorefrontUxSourceMigration.key}:v1`,
      description: catalogStorefrontUxSourceMigration.description,
      name: catalogStorefrontUxSourceMigration.key,
      up: upgradeCatalogStorefrontUxSources,
      version: 1
    }
  ]
};
const ecommerceStorefrontErpnextLinksMigrationBatch: MigrationBatch<EcommerceDatabase> = {
  batch: 20,
  description: "Storefront ERPNext Item link compatibility.",
  scope: "ecommerce",
  version: "1.0.70",
  steps: [
    {
      checksum: `${catalogStorefrontErpnextLinksMigration.key}:v1`,
      description: catalogStorefrontErpnextLinksMigration.description,
      name: catalogStorefrontErpnextLinksMigration.key,
      up: upgradeCatalogStorefrontErpnextLinks,
      version: 1
    }
  ]
};

export function resolveEcommerceDatabaseName(value: unknown) {
  void value;
  return env.DB_MASTER_NAME;
}

export function runWithEcommerceDatabase<T>(databaseName: string, callback: () => T) {
  void databaseName;
  return callback();
}

export function registerEcommerceTenantDatabaseConnection(input: ConnectionOptions) {
  void input;
}

export function getEcommerceDatabase(databaseName?: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  const existing = connections.get(name);
  if (existing) {
    existing.lastUsedAt = Date.now();
    return existing.database;
  }
  const database = new Kysely<EcommerceDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        database: name,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        user: env.DB_USER,
        connectionLimit: 4,
        idleTimeout: 60_000,
        maxIdle: 1,
        queueLimit: 100,
        timezone: "Z"
      } satisfies PoolOptions)
    })
  });
  connections.set(name, { database, lastUsedAt: Date.now() });
  return database;
}

export async function bootstrapEcommerceDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  if (migrated.has(name)) return;
  await ensureDatabase(name);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogSyncMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogSyncAuditMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceModuleDataSourceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontProfileMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogCompatibilityMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceCatalogSeedCompatibilityMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceCatalogStorefrontSliderMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontSliderDocumentMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommercePromotionCardMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontSourceCompatibilityMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommercePromotionBadgeColorMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceFeaturedCardMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontProfileSocialLinksMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontProfileUxContentMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontPerformanceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontSchemaMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontUxSourceMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontErpnextLinksMigrationBatch
  );
  await runWithEcommerceDatabase(name, seedProductInformationModule);
  await runWithEcommerceDatabase(name, seedProductVariantModule);
  await runWithEcommerceDatabase(name, seedProductImageModule);
  await runWithEcommerceDatabase(name, seedCatalogMatchingModule);
  await runWithEcommerceDatabase(name, seedStorefrontAnnouncementModule);
  await runWithEcommerceDatabase(name, seedStorefrontProfileModule);
  migrated.add(name);
}

export async function migrateEcommerceTenantDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  await ensureDatabase(name);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogSyncMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogSyncAuditMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceModuleDataSourceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontProfileMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceCatalogCompatibilityMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceCatalogSeedCompatibilityMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceCatalogStorefrontSliderMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontSliderDocumentMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommercePromotionCardMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontSourceCompatibilityMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommercePromotionBadgeColorMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceFeaturedCardMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontProfileSocialLinksMigrationBatch
  );
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontProfileUxContentMigrationBatch
  );
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontPerformanceMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontSchemaMigrationBatch);
  await runMigrationBatch(getEcommerceDatabase(name), ecommerceStorefrontUxSourceMigrationBatch);
  await runMigrationBatch(
    getEcommerceDatabase(name),
    ecommerceStorefrontErpnextLinksMigrationBatch
  );
}

export async function seedEcommerceTenantDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  await bootstrapEcommerceDatabase(name);
  await runWithEcommerceDatabase(name, seedProductInformationModule);
  await runWithEcommerceDatabase(name, seedProductVariantModule);
  await runWithEcommerceDatabase(name, seedProductImageModule);
  await runWithEcommerceDatabase(name, seedCatalogMatchingModule);
  await runWithEcommerceDatabase(name, seedStorefrontAnnouncementModule);
  await runWithEcommerceDatabase(name, seedStorefrontProfileModule);
}

export async function rollbackEcommerceTenantDatabase(databaseName: string) {
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontErpnextLinksMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontUxSourceMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontSchemaMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontPerformanceMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontProfileUxContentMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontProfileSocialLinksMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceFeaturedCardMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommercePromotionBadgeColorMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontSourceCompatibilityMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommercePromotionCardMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontSliderDocumentMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceCatalogStorefrontSliderMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceCatalogSeedCompatibilityMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceCatalogCompatibilityMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontProfileMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceModuleDataSourceMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceCatalogSyncAuditMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceCatalogSyncMigrationBatch
  );
  await rollbackMigrationBatch(
    getEcommerceDatabase(databaseName),
    ecommerceStorefrontMigrationBatch
  );
  return rollbackMigrationBatch(getEcommerceDatabase(databaseName), ecommerceMigrationBatch);
}

export async function closeAllEcommerceDatabases() {
  const open = Array.from(connections.values(), ({ database }) => database);
  connections.clear();
  migrated.clear();
  await Promise.all(open.map((database) => database.destroy()));
}

async function ensureDatabase(databaseName: string) {
  const name = resolveEcommerceDatabaseName(databaseName);
  const connection = await createConnection({
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
    user: env.DB_USER,
    timezone: "Z"
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}
