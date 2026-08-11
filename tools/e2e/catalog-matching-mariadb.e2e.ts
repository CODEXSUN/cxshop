import assert from "node:assert/strict";
import { sql } from "kysely";
import {
  bootstrapEcommerceDatabase,
  closeAllEcommerceDatabases,
  getEcommerceDatabase
} from "../../apps/ecommerce/api/src/database/ecommerce-database.js";
import { ecommerceEnv } from "../../apps/ecommerce/api/src/env.js";
import { CatalogMatchingService } from "../../apps/ecommerce/api/src/modules/catalog-matching/catalog-matching.service.js";

const sourceReference = `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}`;

try {
  assert.equal(ecommerceEnv.DB_MASTER_NAME, "cxshop_db");
  await bootstrapEcommerceDatabase(ecommerceEnv.DB_MASTER_NAME);
  const service = new CatalogMatchingService();
  const record = await service.match({
    allowSemantic: true,
    brand: "No Such Brand",
    sourceReference,
    title: "No Such Product"
  });
  assert.equal(record.status, "semantic_pending");
  assert.equal(record.strategy, "none");

  const result = await sql<{ count: number | string }>`
    SELECT COUNT(*) AS count
    FROM ecommerce_catalog_match_outbox
    WHERE aggregate_id = ${record.uuid}
      AND event_name = 'ecommerce.catalog-match.semantic-requested'
      AND status = 'pending'
  `.execute(getEcommerceDatabase());
  assert.equal(Number(result.rows[0]?.count), 1);
  console.info("[e2e.ok] catalog request and outbox committed in cxshop_db");
} finally {
  const database = getEcommerceDatabase();
  await database.transaction().execute(async (transaction) => {
    await sql`
      DELETE FROM ecommerce_catalog_match_outbox
      WHERE aggregate_id IN (
        SELECT uuid FROM ecommerce_catalog_match_requests WHERE source_reference = ${sourceReference}
      )
    `.execute(transaction);
    await sql`
      DELETE FROM ecommerce_catalog_match_requests WHERE source_reference = ${sourceReference}
    `.execute(transaction);
  });
  await closeAllEcommerceDatabases();
}
