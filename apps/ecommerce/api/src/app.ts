import type { FastifyInstance, FastifyRequest } from "fastify";
import { requireApplicationAccess } from "@cxshop/framework/api";
import { ecommerceEnv } from "./env.js";
import {
  bootstrapEcommerceDatabase,
  resolveEcommerceDatabaseName
} from "./database/ecommerce-database.js";
import { productInformationModule } from "./modules/product-information/index.js";
import { productVariantModule } from "./modules/product-variant/index.js";
import { productImageModule } from "./modules/product-image/index.js";
import { catalogMatchingModule } from "./modules/catalog-matching/index.js";
import { registerStorefrontRoutes } from "./modules/storefront/index.js";
import {
  registerStorefrontAnnouncementPublicRoutes,
  storefrontAnnouncementModule
} from "./modules/storefront-announcement/index.js";
import {
  CatalogDataSourceService,
  catalogDataSourceModuleKey,
  registerCatalogDataSourceRoutes,
  type CatalogDataSourceControl
} from "./modules/catalog-data-source/index.js";
import { StorefrontService } from "./modules/storefront/storefront.service.js";
import { startCatalogCacheRefresh } from "./modules/catalog-data-source/catalog-data-source.scheduler.js";
import {
  registerStorefrontProfilePublicRoutes,
  registerStorefrontProfileRoutes,
  storefrontProfileModuleKey
} from "./modules/storefront-profile/index.js";
import {
  registerStorefrontSliderImageRoutes,
  storefrontSliderModule
} from "./modules/storefront-slider/index.js";
import { promotionCardModule } from "./modules/promotion-card/index.js";

export const ecommerceApiModuleKeys = [
  productInformationModule.key,
  productVariantModule.key,
  productImageModule.key,
  catalogMatchingModule.key,
  storefrontAnnouncementModule.key,
  storefrontSliderModule.key,
  promotionCardModule.key,
  catalogDataSourceModuleKey,
  storefrontProfileModuleKey
];
export async function registerEcommerceApi(
  app: FastifyInstance,
  dependencies: {
    catalogDataSource: CatalogDataSourceControl;
    resolveActorEmail: (request: FastifyRequest) => string;
  }
) {
  await bootstrapEcommerceDatabase(resolveEcommerceDatabaseName(undefined));
  const catalogDataSource = new CatalogDataSourceService(dependencies.catalogDataSource);
  startCatalogCacheRefresh(app, catalogDataSource);
  await registerStorefrontRoutes(app, new StorefrontService(catalogDataSource));
  await registerStorefrontAnnouncementPublicRoutes(app);
  await registerStorefrontProfilePublicRoutes(app);
  await registerStorefrontSliderImageRoutes(app);
  await app.register(async (ecommerceApp) => {
    ecommerceApp.addHook("preHandler", async (request) => {
      const database = resolveEcommerceDatabaseName(undefined);
      requireApplicationAccess({
        applicationDatabase: database,
        authorization: request.headers.authorization,
        secret: ecommerceEnv.JWT_SECRET
      });
      await bootstrapEcommerceDatabase(database);
    });
    await productInformationModule.register(ecommerceApp);
    await productVariantModule.register(ecommerceApp);
    await productImageModule.register(ecommerceApp);
    await catalogMatchingModule.register(ecommerceApp);
    await storefrontAnnouncementModule.register(ecommerceApp);
    await storefrontSliderModule.register(ecommerceApp);
    await promotionCardModule.register(ecommerceApp);
    await registerStorefrontProfileRoutes(ecommerceApp, dependencies.resolveActorEmail);
    await registerCatalogDataSourceRoutes(
      ecommerceApp,
      catalogDataSource,
      dependencies.resolveActorEmail
    );
  });
}
