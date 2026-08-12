import assert from "node:assert/strict";
import { createApp } from "../../apps/platform/api/src/app.js";

const app = await createApp();
const browserHeaders = { host: "127.0.0.1:8020", origin: "http://127.0.0.1:8020" };

try {
  await app.ready();
  const login = await app.inject({
    method: "POST",
    url: "/auth/login",
    headers: browserHeaders,
    payload: {
      desk: "sa",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD
    }
  });
  assert.equal(login.statusCode, 200, login.body);
  const superAdminCookie = sessionCookie(login.cookies);
  const superAdminHeaders = { ...browserHeaders, cookie: superAdminCookie };

  const saved = await app.inject({
    method: "PUT",
    url: "/admin/data-source/frappe",
    headers: superAdminHeaders,
    payload: {
      connectionName: "Frappe",
      enabled: true,
      saveToEnvironment: false,
      url: "http://localhost:8000"
    }
  });
  assert.equal(saved.statusCode, 200, saved.body);

  const applicationLogin = await app.inject({
    method: "POST",
    url: "/auth/login",
    headers: browserHeaders,
    payload: {
      desk: "admin",
      email: process.env.DEFAULT_TENANT_ADMIN_EMAIL,
      password: process.env.DEFAULT_TENANT_ADMIN_PASSWORD
    }
  });
  assert.equal(applicationLogin.statusCode, 200, applicationLogin.body);
  const headers = { ...browserHeaders, cookie: sessionCookie(applicationLogin.cookies) };

  const seeded = await app.inject({
    method: "POST",
    url: "/ecommerce/settings/data-source/sync/seed-demo",
    headers
  });
  assert.equal(seeded.statusCode, 200, seeded.body);
  assert.ok(seeded.json().data?.items >= 50, seeded.body);
  assert.ok(seeded.json().data?.catalogs >= 10, seeded.body);
  assert.ok(seeded.json().data?.erpnextItems >= 50, seeded.body);

  const pushed = await app.inject({
    method: "POST",
    url: "/ecommerce/settings/data-source/sync/push",
    headers
  });
  assert.equal(pushed.statusCode, 200, pushed.body);
  assert.equal(pushed.json().data?.direction, "own-to-frappe");

  const switched = await app.inject({
    method: "PUT",
    url: "/ecommerce/settings/data-source",
    headers,
    payload: { module: "products", provider: "frappe" }
  });
  assert.equal(switched.statusCode, 200, switched.body);

  const storefront = await app.inject({
    method: "GET",
    url: "/storefront/catalog?search=Acer%20Aspire%205%2015"
  });
  assert.equal(storefront.statusCode, 200, storefront.body);
  const products = storefront.json().data ?? [];
  assert.ok(
    products.some((product: { slug?: string }) => product.slug === "cxshop-demo-laptop-01")
  );
  console.info("[e2e.ok] Frappe and CXShop catalog synchronized in both directions", {
    catalogs: seeded.json().data.catalogs,
    items: seeded.json().data.items,
    storefrontProducts: products.length
  });
} finally {
  await app.close();
}

function sessionCookie(cookies: Array<{ name: string; value: string }>) {
  const cookie = cookies.findLast(({ name, value }) => name.endsWith("cxshop_session") && value);
  assert.ok(cookie, "Super admin login did not issue a CXShop session cookie.");
  return `${cookie.name}=${cookie.value}`;
}
