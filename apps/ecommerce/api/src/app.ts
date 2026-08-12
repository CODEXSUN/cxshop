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

export const ecommerceApiModuleKeys = [
  productInformationModule.key,
  productVariantModule.key,
  productImageModule.key,
  catalogMatchingModule.key,
  storefrontAnnouncementModule.key,
  catalogDataSourceModuleKey
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
  await registerStorefrontRoutes(app, new StorefrontService(catalogDataSource));
  await registerStorefrontAnnouncementPublicRoutes(app);
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
    await registerCatalogDataSourceRoutes(
      ecommerceApp,
      catalogDataSource,
      dependencies.resolveActorEmail
    );
  });
}
