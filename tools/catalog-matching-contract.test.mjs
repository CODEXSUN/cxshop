import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const owner = path.join(root, "apps/ecommerce/api/src/modules/catalog-matching");

test("catalog matching owns the complete asynchronous backend slice", async () => {
  const required = [
    "catalog-matching.domain.ts",
    "catalog-matching.migration.ts",
    "catalog-matching.module.ts",
    "catalog-matching.outbox.ts",
    "catalog-matching.repository.ts",
    "catalog-matching.routes.ts",
    "catalog-matching.seed.ts",
    "catalog-matching.service.ts",
    "catalog-matching.types.ts",
    "catalog-matching.worker.ts",
    "catalog-matching.domain.test.ts",
    "index.ts"
  ];
  await Promise.all(required.map((file) => readFile(path.join(owner, file), "utf8")));
});

test("state and semantic outbox are written inside one MariaDB transaction", async () => {
  const repository = await readFile(path.join(owner, "catalog-matching.repository.ts"), "utf8");
  const transactionAt = repository.indexOf("database.transaction().execute");
  const requestAt = repository.indexOf("INSERT INTO ecommerce_catalog_match_requests");
  const outboxAt = repository.indexOf("INSERT INTO ecommerce_catalog_match_outbox");
  assert.ok(transactionAt >= 0 && requestAt > transactionAt && outboxAt > requestAt);
});

test("deterministic matching precedes the semantic worker", async () => {
  const domain = await readFile(path.join(owner, "catalog-matching.domain.ts"), "utf8");
  const service = await readFile(path.join(owner, "catalog-matching.service.ts"), "utf8");
  assert.deepEqual(
    ["sku", "barcode", "slug"].map((strategy) => domain.indexOf(`strategy: "${strategy}"`)),
    [
      domain.indexOf('strategy: "sku"'),
      domain.indexOf('strategy: "barcode"'),
      domain.indexOf('strategy: "slug"')
    ]
  );
  assert.ok(domain.indexOf('strategy: "sku"') < domain.indexOf('strategy: "barcode"'));
  assert.ok(domain.indexOf('strategy: "barcode"') < domain.indexOf('strategy: "slug"'));
  assert.match(service, /deterministicCatalogMatch/);
  assert.match(service, /semantic_pending/);
  assert.doesNotMatch(domain, /SemanticCatalogMatcher|embedding|vector/iu);
});

test("deployment keeps MariaDB as the queue baseline", async () => {
  const env = await readFile(path.join(root, ".container/deploy.env.sample"), "utf8");
  const configure = await readFile(path.join(root, "tools/configure-env.mjs"), "utf8");
  assert.match(env, /^CXSHOP_QUEUE_BACKEND=database$/mu);
  assert.match(configure, /current\.set\("CXSHOP_QUEUE_BACKEND", "database"\)/u);
});
