import assert from "node:assert/strict";
import test from "node:test";
import { matchesServiceHealthContract } from "./dev-stack-health.mjs";
import { affectedProductStacks, productStackContract } from "./product-stack-contract.mjs";

test("product packages compose into the single Platform runtime without sharing ownership", () => {
  assert.deepEqual(productStackContract.billing.formula, [
    "framework",
    "platform",
    "core",
    "billing"
  ]);
  assert.deepEqual(productStackContract.billing.services, ["platform-api", "platform-web"]);
  assert.equal(productStackContract.billing.deploymentPolicy, "composed-platform-release");
  assert.deepEqual(productStackContract.ecommerce.formula, [
    "framework",
    "platform",
    "core",
    "billing-contracts",
    "ecommerce"
  ]);
  assert.deepEqual(productStackContract.ecommerce.ownedDatabaseScopes, ["tenant-ecommerce"]);
});

test("stack impact keeps product-only changes inside their release boundary", () => {
  assert.deepEqual(affectedProductStacks(["apps/billing/api/src/app.ts"]), ["billing"]);
  assert.deepEqual(affectedProductStacks(["apps/ecommerce/api/src/app.ts"]), ["ecommerce"]);
  assert.deepEqual(affectedProductStacks(["packages/framework/src/api/index.ts"]), [
    "billing",
    "ecommerce"
  ]);
  assert.deepEqual(affectedProductStacks(["tools/product-stack-contract.mjs"]), [
    "billing",
    "ecommerce"
  ]);
});

test("development attachment accepts only the expected healthy dependency", () => {
  const health = {
    data: { checks: { "platform-api": { status: "ok" } }, status: "ok" },
    success: true
  };
  assert.equal(matchesServiceHealthContract(health, "platform-api"), true);
  assert.equal(matchesServiceHealthContract(health, "core-api"), false);
  assert.equal(matchesServiceHealthContract({ ...health, success: false }, "platform-api"), false);
});
