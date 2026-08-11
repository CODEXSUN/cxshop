import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError } from "@cxshop/framework/errors";
import { registerContractRoute } from "@cxshop/framework/http";
import { StorefrontService } from "./storefront.service.js";

const product = z.object({
  brand: z.string().nullable(),
  category: z.string(),
  compareAtPrice: z.number().nullable(),
  description: z.string(),
  featured: z.boolean(),
  imageAlt: z.string(),
  imageUrl: z.string(),
  name: z.string(),
  price: z.number(),
  shortDescription: z.string(),
  slug: z.string(),
  subtitle: z.string(),
  variantCount: z.number()
});
const searchScope = z.enum(["all", "products", "brands", "categories"]);
const sort = z.enum(["featured", "name", "price-asc", "price-desc", "discount"]);

export async function registerStorefrontRoutes(app: FastifyInstance) {
  const service = new StorefrontService();
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/site-navigation",
    schemas: {
      response: z.object({
        about: z.string(),
        copyrightOwner: z.string(),
        groups: z.array(
          z.object({
            title: z.string(),
            links: z.array(z.object({ label: z.string(), href: z.string() }))
          })
        ),
        socialLinks: z.array(z.object({ label: z.string(), href: z.string() }))
      })
    },
    handler: () => service.siteNavigation()
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/catalog",
    schemas: {
      querystring: z.object({
        brand: z.string().max(120).optional(),
        category: z.string().max(120).optional(),
        maxPrice: z.coerce.number().nonnegative().optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        scope: searchScope.optional(),
        search: z.string().max(120).optional(),
        sort: sort.optional()
      }),
      response: z.array(product)
    },
    handler: ({ query }) => service.catalog(query)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/categories",
    schemas: {
      response: z.array(z.object({ name: z.string(), productCount: z.number() }))
    },
    handler: () => service.categories()
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/discovery",
    schemas: {
      response: z.object({
        brands: z.array(
          z.object({
            logoAlt: z.string(),
            logoUrl: z.string(),
            name: z.string(),
            productCount: z.number()
          })
        ),
        categories: z.array(z.object({ name: z.string(), productCount: z.number() })),
        priceRange: z.object({ maximum: z.number(), minimum: z.number() })
      })
    },
    handler: () => service.discovery()
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/storefront/products/:slug",
    schemas: {
      params: z.object({ slug: z.string().min(1).max(191) }),
      response: product.extend({
        bulletPoints: z.array(z.string()),
        returnPolicy: z.string(),
        variants: z.array(
          z.object({ id: z.number(), price: z.number(), sku: z.string(), title: z.string() })
        ),
        warranty: z.string()
      })
    },
    handler: async ({ params }) => {
      const result = await service.product(params.slug);
      if (!result) throw AppError.notFound("Storefront product was not found.");
      return result;
    }
  });
}
