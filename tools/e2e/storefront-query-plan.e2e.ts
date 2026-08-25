import assert from "node:assert/strict";
import { sql } from "kysely";
import {
  bootstrapEcommerceDatabase,
  closeAllEcommerceDatabases,
  getEcommerceDatabase
} from "../../apps/ecommerce/api/src/database/ecommerce-database.js";
import { ecommerceEnv } from "../../apps/ecommerce/api/src/env.js";

try {
  await bootstrapEcommerceDatabase(ecommerceEnv.DB_MASTER_NAME);
  const plan = await sql<Record<string, unknown>>`EXPLAIN SELECT info.id
    FROM ecommerce_product_information info
    INNER JOIN core_products product ON product.id=info.core_product_id
    LEFT JOIN ecommerce_product_variants variant ON variant.product_information_id=info.id AND variant.status='active'
    WHERE info.publication_status='published' AND info.status='active'
      AND info.frappe_modified_at IS NULL AND product.status='active' AND product.deleted_at IS NULL
    GROUP BY info.id ORDER BY info.is_featured DESC,info.storefront_title LIMIT 24`.execute(
    getEcommerceDatabase()
  );
  assert.ok(plan.rows.length > 0, "Storefront catalog query must produce an execution plan.");
  assert.ok(
    plan.rows.some((row) => String(row.key ?? row.Key ?? "").length > 0),
    "Storefront catalog query must use at least one database index."
  );
  console.info("[e2e.ok] storefront query plan uses indexed access");
} finally {
  await closeAllEcommerceDatabases();
}
