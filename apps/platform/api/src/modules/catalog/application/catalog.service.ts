import { createCategorySchema, createProductSchema } from "@cxshop/contracts";
import { CatalogRepository } from "../infrastructure/catalog.repository";

export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}
  listStoreCategories() { return this.repository.listCategories(true); }
  listStoreProducts(category?: string) { return this.repository.listProducts(true, category); }
  getStoreProduct(slug: string) { return this.repository.findProduct(slug); }
  listAdminCategories() { return this.repository.listCategories(); }
  listAdminProducts() { return this.repository.listProducts(); }
  createCategory(input: unknown, actorId: string, correlationId: string) { return this.repository.createCategory(createCategorySchema.parse(input), actorId, correlationId); }
  createProduct(input: unknown, actorId: string, correlationId: string) { return this.repository.createProduct(createProductSchema.parse(input), actorId, correlationId); }
}
