import { randomUUID } from "node:crypto";
import type { CategoryDto, ProductDetailDto, ProductSummaryDto } from "@cxshop/contracts";
import type { DatabaseConnection, DatabaseTransaction } from "@cxshop/framework";
import type { CatalogStatus } from "../domain/catalog";

type CategoryInput = { name: string; slug: string; description: string; status: CatalogStatus };
type ProductInput = { key: string; name: string; slug: string; summary: string; description: string; categoryId: string; status: CatalogStatus };

export class CatalogRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async listCategories(publicOnly = false): Promise<CategoryDto[]> {
    let query = this.database.selectFrom("cxshop_categories").select(["public_id as id", "name", "slug", "description", "status"]).orderBy("sort_order").orderBy("name");
    if (publicOnly) query = query.where("status", "=", "active");
    const rows = await query.execute();
    return Promise.all(rows.map(async row => ({ ...row, productCount: await this.productCount(row.id, publicOnly) })));
  }

  async listProducts(publicOnly = false, categorySlug?: string): Promise<ProductSummaryDto[]> {
    let query = this.database.selectFrom("cxshop_products as product")
      .leftJoin("cxshop_product_categories as link", join => join.onRef("link.product_id", "=", "product.id").on("link.is_primary", "=", true))
      .leftJoin("cxshop_categories as category", "category.id", "link.category_id")
      .select(["product.id as internalId", "product.public_id as id", "product.product_key as key", "product.name", "product.slug", "product.summary", "product.status", "category.name as category"])
      .orderBy("product.created_at", "desc");
    if (publicOnly) query = query.where("product.status", "=", "active").where("category.status", "=", "active");
    if (categorySlug) query = query.where("category.slug", "=", categorySlug);
    const rows = await query.execute();
    return Promise.all(rows.map(async ({ internalId, ...row }) => ({ ...row, imageUrl: await this.firstMedia(internalId) })));
  }

  async findProduct(slug: string): Promise<ProductDetailDto | undefined> {
    const summary = (await this.listProducts(true)).find(product => product.slug === slug);
    if (!summary) return undefined;
    const product = await this.database.selectFrom("cxshop_products").select(["id", "description"]).where("public_id", "=", summary.id).executeTakeFirstOrThrow();
    const variants = await this.database.selectFrom("cxshop_product_variants").select(["public_id as id", "sku", "name"]).where("product_id", "=", product.id).where("status", "=", "active").orderBy("id").execute();
    return { ...summary, description: product.description, variants };
  }

  async createCategory(input: CategoryInput, actorId: string, correlationId: string): Promise<CategoryDto> {
    const publicId = randomUUID();
    await this.database.transaction().execute(async transaction => {
      const catalog = await transaction.selectFrom("cxshop_catalogs").select("id").where("catalog_key", "=", "MAIN").executeTakeFirstOrThrow();
      await transaction.insertInto("cxshop_categories").values({ public_id: publicId, catalog_id: catalog.id, parent_id: null, sort_order: 100, ...input }).execute();
      await this.recordChange(transaction, "category", publicId, input.status, actorId, correlationId, input);
    });
    return (await this.listCategories()).find(item => item.id === publicId)!;
  }

  async createProduct(input: ProductInput, actorId: string, correlationId: string): Promise<ProductDetailDto> {
    const publicId = randomUUID();
    await this.database.transaction().execute(async transaction => {
      const category = await transaction.selectFrom("cxshop_categories").select("id").where("public_id", "=", input.categoryId).where("status", "!=", "archived").executeTakeFirstOrThrow();
      const { categoryId: _categoryId, ...product } = input;
      const inserted = await transaction.insertInto("cxshop_products").values({ public_id: publicId, product_key: product.key, name: product.name, slug: product.slug, summary: product.summary, description: product.description, status: product.status }).executeTakeFirstOrThrow();
      await transaction.insertInto("cxshop_product_categories").values({ product_id: Number(inserted.insertId), category_id: category.id, is_primary: true }).execute();
      await transaction.insertInto("cxshop_product_variants").values({ public_id: randomUUID(), product_id: Number(inserted.insertId), sku: `${product.key}-DEFAULT`, name: "Standard", attributes: "{}", status: product.status }).execute();
      await this.recordChange(transaction, "product", publicId, product.status, actorId, correlationId, input);
    });
    return (await this.findAnyProduct(publicId))!;
  }

  private async productCount(categoryId: string, publicOnly: boolean): Promise<number> {
    let query = this.database.selectFrom("cxshop_product_categories as link").innerJoin("cxshop_categories as category", "category.id", "link.category_id").innerJoin("cxshop_products as product", "product.id", "link.product_id").select(({ fn }) => fn.count<number>("product.id").as("count")).where("category.public_id", "=", categoryId);
    if (publicOnly) query = query.where("product.status", "=", "active");
    return Number((await query.executeTakeFirst())?.count ?? 0);
  }

  private async firstMedia(productId: number): Promise<string | null> {
    return (await this.database.selectFrom("cxshop_product_media").select("media_url").where("product_id", "=", productId).orderBy("sort_order").executeTakeFirst())?.media_url ?? null;
  }

  private async findAnyProduct(publicId: string): Promise<ProductDetailDto | undefined> {
    const row = await this.database.selectFrom("cxshop_products as product").leftJoin("cxshop_product_categories as link", "link.product_id", "product.id").leftJoin("cxshop_categories as category", "category.id", "link.category_id").select(["product.id as internalId", "product.public_id as id", "product.product_key as key", "product.name", "product.slug", "product.summary", "product.description", "product.status", "category.name as category"]).where("product.public_id", "=", publicId).executeTakeFirst();
    if (!row) return undefined;
    const { internalId, ...product } = row;
    const variants = await this.database.selectFrom("cxshop_product_variants").select(["public_id as id", "sku", "name"]).where("product_id", "=", internalId).execute();
    return { ...product, imageUrl: await this.firstMedia(internalId), variants };
  }

  private async recordChange(transaction: DatabaseTransaction, resource: "category" | "product", publicId: string, status: CatalogStatus, actorId: string, correlationId: string, details: object): Promise<void> {
    const eventName = status === "active" ? `catalog.${resource}.published` : `catalog.${resource}.created`;
    await transaction.insertInto("cxshop_audit_events").values({ public_id: randomUUID(), actor_public_id: actorId, action: eventName, resource_type: resource, resource_public_id: publicId, correlation_id: correlationId, details: JSON.stringify(details) }).execute();
    await transaction.insertInto("cxshop_outbox").values({ event_id: randomUUID(), event_name: eventName, event_version: 1, aggregate_type: resource, aggregate_id: publicId, actor_id: actorId, correlation_id: correlationId, payload: JSON.stringify({ id: publicId, status }), published_at: null }).execute();
  }
}
