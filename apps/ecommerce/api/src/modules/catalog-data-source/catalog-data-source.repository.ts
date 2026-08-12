import { sql, type Transaction } from "kysely";
import type { EcommerceDatabase } from "../../database/ecommerce-database.js";
import { getEcommerceDatabase } from "../../database/ecommerce-database.js";
import type {
  CatalogDataSourceModule,
  CatalogDataSourceProvider,
  FrappeCatalogSnapshot,
  FrappeErpItem,
  FrappeIShopCatalog,
  FrappeIShopItem
} from "./catalog-data-source.types.js";

type Row = Record<string, unknown>;

export class CatalogDataSourceRepository {
  async moduleProviders() {
    const result = await sql<{
      module_key: CatalogDataSourceModule;
      provider: CatalogDataSourceProvider;
      updated_at: Date | string;
      updated_by: string;
    }>`SELECT module_key,provider,updated_by,updated_at
      FROM ecommerce_catalog_module_data_sources ORDER BY id`.execute(getEcommerceDatabase());
    return result.rows.map((row) => ({
      module: row.module_key,
      provider: row.provider,
      updatedAt: new Date(row.updated_at).toISOString(),
      updatedBy: row.updated_by
    }));
  }

  async saveModuleProvider(
    module: CatalogDataSourceModule,
    provider: CatalogDataSourceProvider,
    actorEmail: string
  ) {
    await sql`INSERT INTO ecommerce_catalog_module_data_sources (module_key,provider,updated_by)
      VALUES (${module},${provider},${actorEmail})
      ON DUPLICATE KEY UPDATE provider=VALUES(provider),updated_by=VALUES(updated_by),updated_at=CURRENT_TIMESTAMP`.execute(
      getEcommerceDatabase()
    );
  }

  async replaceFromFrappe(snapshot: FrappeCatalogSnapshot) {
    const database = getEcommerceDatabase();
    await database.transaction().execute(async (transaction) => {
      for (const item of snapshot.items) {
        const erp = snapshot.erpnext_items.find(
          (candidate) => candidate.item_code === (item.erpnext_item || item.item_code)
        );
        await this.upsertItem(transaction, item, erp);
      }
      for (const catalog of snapshot.catalogs) await this.upsertCatalog(transaction, catalog);
      await sql`INSERT INTO ecommerce_catalog_sync_runs
        (direction,status,item_count,catalog_count,details_json)
        VALUES ('frappe-to-own','completed',${snapshot.items.length},${snapshot.catalogs.length},${JSON.stringify({ erpnextItems: snapshot.erpnext_items.length })})`.execute(
        transaction
      );
    });
  }

  async snapshot(): Promise<FrappeCatalogSnapshot> {
    const database = getEcommerceDatabase();
    const [items, catalogs, memberships] = await Promise.all([
      sql<Row>`SELECT info.*,product.name AS item_name,product.opening_price,category.name AS category_name,
        brand.name AS brand_name,image.url AS primary_image FROM ecommerce_product_information info
        INNER JOIN core_products product ON product.id=info.core_product_id AND product.deleted_at IS NULL
        LEFT JOIN core_product_categories category ON category.id=product.product_category_id
        LEFT JOIN core_brands brand ON brand.id=info.brand_id
        LEFT JOIN ecommerce_product_images image ON image.product_information_id=info.id AND image.is_primary=1 AND image.status='active'
        WHERE info.status='active' AND info.frappe_item_code IS NOT NULL ORDER BY info.frappe_item_code`.execute(
        database
      ),
      sql<Row>`SELECT * FROM ecommerce_ishop_catalogs ORDER BY catalog_code`.execute(database),
      sql<Row>`SELECT membership.*,catalog.catalog_code FROM ecommerce_catalog_items membership
        INNER JOIN ecommerce_ishop_catalogs catalog ON catalog.id=membership.catalog_id ORDER BY membership.display_order`.execute(
        database
      )
    ]);
    const ishopItems = items.rows.map(toIShopItem);
    return {
      erpnext_items: items.rows.map(toErpItem),
      items: ishopItems,
      catalogs: catalogs.rows.map((catalog) => ({
        catalog_code: String(catalog.catalog_code),
        catalog_name: String(catalog.catalog_name),
        description: String(catalog.description ?? ""),
        catalog_image: String(catalog.catalog_image ?? ""),
        published: Number(catalog.published ?? 0),
        catalog_items: memberships.rows
          .filter((row) => row.catalog_code === catalog.catalog_code)
          .map((row) => ({
            display_order: Number(row.display_order ?? 0),
            ishop_item: String(row.ishop_item)
          }))
      }))
    };
  }

  async recordPush(snapshot: FrappeCatalogSnapshot) {
    await sql`INSERT INTO ecommerce_catalog_sync_runs
      (direction,status,item_count,catalog_count,details_json)
      VALUES ('own-to-frappe','completed',${snapshot.items.length},${snapshot.catalogs.length},${JSON.stringify({ erpnextItems: snapshot.erpnext_items.length })})`.execute(
      getEcommerceDatabase()
    );
  }

  private async upsertItem(
    transaction: Transaction<EcommerceDatabase>,
    item: FrappeIShopItem,
    erp?: FrappeErpItem
  ) {
    const categoryName = item.item_group || erp?.item_group || "Uncategorised";
    await sql`INSERT INTO core_product_categories (name,status) VALUES (${categoryName},'active')
      ON DUPLICATE KEY UPDATE status='active'`.execute(transaction);
    const category = await sql<{
      id: number;
    }>`SELECT id FROM core_product_categories WHERE name=${categoryName} LIMIT 1`.execute(
      transaction
    );
    const brandName = item.brand || erp?.brand || null;
    let brandId: number | null = null;
    if (brandName) {
      await sql`INSERT INTO core_brands (name,status) VALUES (${brandName},'active')
        ON DUPLICATE KEY UPDATE status='active'`.execute(transaction);
      const brand = await sql<{
        id: number;
      }>`SELECT id FROM core_brands WHERE name=${brandName} LIMIT 1`.execute(transaction);
      brandId = brand.rows[0]?.id ?? null;
    }
    const existing = await sql<{ core_product_id: number; id: number }>`SELECT id,core_product_id
      FROM ecommerce_product_information WHERE frappe_item_code=${item.item_code} LIMIT 1`.execute(
      transaction
    );
    let productId = existing.rows[0]?.core_product_id;
    if (!productId) {
      await sql`INSERT INTO core_products (uuid,name,product_category_id,opening_price,status)
        VALUES (LOWER(SUBSTRING(MD5(UUID()),1,8)),${item.item_name},${category.rows[0]?.id ?? null},${Number(item.web_price ?? erp?.standard_rate ?? 0)},'active')
        ON DUPLICATE KEY UPDATE product_category_id=VALUES(product_category_id),opening_price=VALUES(opening_price),status='active',deleted_at=NULL`.execute(
        transaction
      );
      const product = await sql<{
        id: number;
      }>`SELECT id FROM core_products WHERE name=${item.item_name} LIMIT 1`.execute(transaction);
      productId = product.rows[0]?.id;
    } else {
      await sql`UPDATE core_products SET name=${item.item_name},product_category_id=${category.rows[0]?.id ?? null},
        opening_price=${Number(item.web_price ?? erp?.standard_rate ?? 0)},status='active',deleted_at=NULL WHERE id=${productId}`.execute(
        transaction
      );
    }
    const slug = slugify(item.item_code);
    await sql`INSERT INTO ecommerce_product_information
      (uuid,core_product_id,brand_id,storefront_title,slug,short_description,description,bullet_points_json,
       publication_status,is_featured,status,frappe_item_code,erpnext_item,availability,item_group,web_price,mrp,
       frappe_image,highlights,published)
      VALUES (LOWER(SUBSTRING(MD5(UUID()),1,8)),${productId},${brandId},${item.item_name},${slug},
        ${item.short_description ?? ""},${item.full_description ?? ""},${JSON.stringify(highlights(item.highlights))},
        ${item.published ? "published" : "draft"},1,'active',${item.item_code},${item.erpnext_item ?? item.item_code},
        ${item.availability ?? "Immediately"},${categoryName},${Number(item.web_price ?? 0)},${Number(item.mrp ?? 0)},
        ${item.image ?? ""},${item.highlights ?? ""},${item.published ? 1 : 0})
      ON DUPLICATE KEY UPDATE core_product_id=VALUES(core_product_id),brand_id=VALUES(brand_id),
        storefront_title=VALUES(storefront_title),short_description=VALUES(short_description),description=VALUES(description),
        bullet_points_json=VALUES(bullet_points_json),publication_status=VALUES(publication_status),
        erpnext_item=VALUES(erpnext_item),availability=VALUES(availability),item_group=VALUES(item_group),
        web_price=VALUES(web_price),mrp=VALUES(mrp),frappe_image=VALUES(frappe_image),highlights=VALUES(highlights),published=VALUES(published)`.execute(
      transaction
    );
    const info = await sql<{
      id: number;
    }>`SELECT id FROM ecommerce_product_information WHERE frappe_item_code=${item.item_code} LIMIT 1`.execute(
      transaction
    );
    if (item.image && info.rows[0]) {
      await sql`UPDATE ecommerce_product_images SET is_primary=0 WHERE product_information_id=${info.rows[0].id}`.execute(
        transaction
      );
      const existingImage = await sql<{
        id: number;
      }>`SELECT id FROM ecommerce_product_images WHERE product_information_id=${info.rows[0].id} AND url=${item.image} LIMIT 1`.execute(
        transaction
      );
      if (existingImage.rows[0]) {
        await sql`UPDATE ecommerce_product_images SET is_primary=1,status='active' WHERE id=${existingImage.rows[0].id}`.execute(
          transaction
        );
      } else {
        await sql`INSERT INTO ecommerce_product_images
          (uuid,product_information_id,url,alt_text,is_primary,status)
          VALUES (LOWER(SUBSTRING(MD5(UUID()),1,8)),${info.rows[0].id},${item.image},${item.item_name},1,'active')`.execute(
          transaction
        );
      }
    }
  }

  private async upsertCatalog(
    transaction: Transaction<EcommerceDatabase>,
    catalog: FrappeIShopCatalog
  ) {
    await sql`INSERT INTO ecommerce_ishop_catalogs
      (catalog_code,catalog_name,description,catalog_image,published)
      VALUES (${catalog.catalog_code},${catalog.catalog_name},${catalog.description ?? ""},${catalog.catalog_image ?? ""},${catalog.published ? 1 : 0})
      ON DUPLICATE KEY UPDATE catalog_name=VALUES(catalog_name),description=VALUES(description),
      catalog_image=VALUES(catalog_image),published=VALUES(published)`.execute(transaction);
    const row = await sql<{
      id: number;
    }>`SELECT id FROM ecommerce_ishop_catalogs WHERE catalog_code=${catalog.catalog_code} LIMIT 1`.execute(
      transaction
    );
    if (!row.rows[0]) return;
    await sql`DELETE FROM ecommerce_catalog_items WHERE catalog_id=${row.rows[0].id}`.execute(
      transaction
    );
    for (const membership of catalog.catalog_items ?? []) {
      const product = await sql<{
        id: number;
      }>`SELECT id FROM ecommerce_product_information WHERE frappe_item_code=${membership.ishop_item} LIMIT 1`.execute(
        transaction
      );
      if (product.rows[0]) {
        await sql`INSERT INTO ecommerce_catalog_items (catalog_id,product_information_id,ishop_item,display_order)
          VALUES (${row.rows[0].id},${product.rows[0].id},${membership.ishop_item},${membership.display_order ?? 0})`.execute(
          transaction
        );
      }
    }
  }
}

function toIShopItem(row: Row): FrappeIShopItem {
  return {
    item_code: String(row.frappe_item_code),
    item_name: String(row.item_name),
    erpnext_item: String(row.erpnext_item || row.frappe_item_code),
    availability: String(row.availability || "Immediately"),
    item_group: String(row.item_group || row.category_name || "Uncategorised"),
    brand: row.brand_name ? String(row.brand_name) : null,
    short_description: String(row.short_description ?? ""),
    full_description: String(row.description ?? ""),
    web_price: Number(row.web_price ?? row.opening_price ?? 0),
    mrp: Number(row.mrp ?? 0),
    image: String(row.frappe_image || row.primary_image || ""),
    highlights: String(row.highlights ?? ""),
    published: Number(row.published ?? 0)
  };
}

function toErpItem(row: Row): FrappeErpItem {
  return {
    item_code: String(row.erpnext_item || row.frappe_item_code),
    item_name: String(row.item_name),
    item_group: String(row.item_group || row.category_name || "Uncategorised"),
    brand: row.brand_name ? String(row.brand_name) : null,
    stock_uom: "Nos",
    description: String(row.description ?? ""),
    image: String(row.frappe_image || row.primary_image || ""),
    disabled: 0,
    is_stock_item: 1,
    standard_rate: Number(row.web_price ?? row.opening_price ?? 0)
  };
}

function highlights(value: unknown) {
  return String(value ?? "")
    .split(/[\n,|]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "");
}
