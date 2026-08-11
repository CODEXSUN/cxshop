import type { FastifyInstance } from "fastify";
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

export const ecommerceApiModuleKeys = [
  productInformationModule.key,
  productVariantModule.key,
  productImageModule.key,
  catalogMatchingModule.key
];
export async function registerEcommerceApi(app: FastifyInstance) {
  await bootstrapEcommerceDatabase(resolveEcommerceDatabaseName(undefined));
  await registerStorefrontRoutes(app);
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
  });
}
