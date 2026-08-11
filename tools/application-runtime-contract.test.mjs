import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the web desk uses application setup instead of tenant runtime", async () => {
  const desk = await readFile("apps/platform/web/src/desks/tenant/AppDesk.tsx", "utf8");
  const setup = await readFile(
    "apps/platform/web/src/modules/application-setup/application-setup.services.ts",
    "utf8"
  );
  assert.doesNotMatch(desk, /getTenantRuntime|\/tenant\/runtime/u);
  assert.match(setup, /\/application\/setup/u);
});

test("Core, Billing, and Ecommerce ignore caller database selection", async () => {
  const files = await Promise.all(
    [
      "apps/core/api/src/database/core-database.ts",
      "apps/billing/api/src/database/billing-database.ts",
      "apps/ecommerce/api/src/database/ecommerce-database.ts"
    ].map((path) => readFile(path, "utf8"))
  );
  for (const source of files) {
    assert.match(source, /void value;\s+return env\.DB_MASTER_NAME/u);
  }
});

test("product APIs require application access without tenant headers", async () => {
  const sources = await Promise.all(
    ["core", "billing", "ecommerce"].map((owner) =>
      readFile(`apps/${owner}/api/src/app.ts`, "utf8")
    )
  );
  for (const source of sources) {
    assert.match(source, /requireApplicationAccess/u);
    assert.doesNotMatch(source, /requireTenantAccess|x-tenant-id/u);
  }
});

test("active access routes are application scoped", async () => {
  const app = await readFile("apps/platform/api/src/app.ts", "utf8");
  const routes = await Promise.all(
    [
      "tenant-user",
      "tenant-role",
      "tenant-permission",
      "tenant-user-role",
      "tenant-role-permission"
    ].map((owner) => readFile(`apps/platform/api/src/modules/${owner}/${owner}.routes.ts`, "utf8"))
  );
  assert.doesNotMatch(app, /seedDefaultTenant|tenantModule|tenantDomainModule/u);
  for (const source of routes) assert.match(source, /\/application\/access\//u);
});

test("Billing reads the standalone application company context", async () => {
  const context = await readFile("apps/billing/web/src/shared/api/tenant-context.ts", "utf8");
  const api = await readFile("apps/billing/web/src/shared/api/billing-api.ts", "utf8");
  assert.match(context, /cxshop\.application\.company-id/u);
  assert.match(context, /cxshop\.application\.financial-year-id/u);
  assert.doesNotMatch(context, /cxshop\.tenant\.(?:company|financial-year)-id/u);
  assert.doesNotMatch(api, /x-tenant-(?:id|db)/u);
});

test("Core organisation bootstrap uses the standalone session cookie", async () => {
  const sources = await Promise.all(
    ["company", "financial-year", "default-company"].map((owner) =>
      readFile(`apps/core/web/src/modules/organisation/${owner}/${owner}.services.ts`, "utf8")
    )
  );
  for (const source of sources) {
    assert.match(source, /credentials:\s*"include"/u);
    assert.doesNotMatch(source, /x-tenant-(?:id|db)|Authorization/u);
  }
});
