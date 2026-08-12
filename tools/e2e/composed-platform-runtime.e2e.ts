import assert from "node:assert/strict";
import { createApp } from "../../apps/platform/api/src/app.js";

const app = await createApp();

try {
  await app.ready();

  const healthResponse = await app.inject({ method: "GET", url: "/health" });
  assert.equal(healthResponse.statusCode, 200, healthResponse.body);
  const modules = healthResponse.json().data?.checks?.["platform-api"]?.details?.modules ?? [];
  for (const moduleKey of [
    "core.common",
    "billing.sales",
    "mail",
    "devkit.platform-registry",
    "ecommerce.catalog.product-information",
    "blogs.article"
  ]) {
    assert.ok(modules.includes(moduleKey), `${moduleKey} was not composed into Platform API.`);
  }

  const webOrigin = process.env.PLATFORM_WEB_ORIGIN ?? "http://app.codexsun.test";
  const corsResponse = await app.inject({
    headers: {
      "access-control-request-headers": "content-type",
      "access-control-request-method": "POST",
      origin: webOrigin
    },
    method: "OPTIONS",
    url: "/auth/login"
  });
  assert.equal(corsResponse.statusCode, 204);
  assert.equal(corsResponse.headers["access-control-allow-origin"], webOrigin);
  assert.equal(corsResponse.headers["access-control-allow-credentials"], "true");

  const rejectedCorsResponse = await app.inject({
    headers: { "access-control-request-method": "POST", origin: "https://untrusted.example" },
    method: "OPTIONS",
    url: "/auth/login"
  });
  assert.equal(rejectedCorsResponse.headers["access-control-allow-origin"], undefined);

  for (const url of ["/core/common/location/countries", "/billing/quotations"]) {
    const response = await app.inject({
      headers: {
        "x-company-id": "1",
        "x-financial-year-id": "1",
        "x-tenant-db": "caller_selected_database",
        "x-tenant-id": "999999"
      },
      method: "GET",
      url
    });
    assert.equal(response.statusCode, 401, `${url} was not protected: ${response.body}`);
  }

  const applicationHost = new URL(webOrigin);
  const browserHeaders = { host: applicationHost.host, origin: applicationHost.origin };
  const contextResponse = await app.inject({
    headers: browserHeaders,
    method: "GET",
    url: "/auth/application-context"
  });
  assert.equal(contextResponse.statusCode, 200, contextResponse.body);
  assert.equal(contextResponse.json().data?.mode, "application");
  assert.equal(contextResponse.json().data?.corporateIdRequired, false);

  const superAdminLogin = await app.inject({
    headers: browserHeaders,
    method: "POST",
    payload: {
      desk: "sa",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD
    },
    url: "/auth/login"
  });
  assert.equal(superAdminLogin.statusCode, 200, superAdminLogin.body);
  const superAdminCookie = sessionCookie(superAdminLogin.cookies);
  const dataSourceSettings = await app.inject({
    headers: { ...browserHeaders, cookie: superAdminCookie },
    method: "GET",
    url: "/admin/data-source/settings"
  });
  assert.equal(dataSourceSettings.statusCode, 200, dataSourceSettings.body);
  assert.equal(dataSourceSettings.json().data?.provider, process.env.CXSHOP_DATA_SOURCE ?? "own");
  assert.equal("apiKey" in (dataSourceSettings.json().data ?? {}), false);
  assert.equal("apiSecret" in (dataSourceSettings.json().data ?? {}), false);
  assert.equal("frappe_api_key_secret" in (dataSourceSettings.json().data ?? {}), false);
  const ownConnection = await app.inject({
    headers: { ...browserHeaders, cookie: superAdminCookie },
    method: "POST",
    url: "/admin/data-source/connections/own/test"
  });
  assert.equal(ownConnection.statusCode, 200, ownConnection.body);
  assert.equal(ownConnection.json().data?.connected, true);
  if (!process.env.CXSHOP_FRAPPE_URL) {
    const frappeSwitch = await app.inject({
      headers: { ...browserHeaders, cookie: superAdminCookie },
      method: "PUT",
      payload: { provider: "frappe" },
      url: "/admin/data-source/settings/provider"
    });
    assert.equal(frappeSwitch.statusCode, 400, frappeSwitch.body);
  }

  const loginResponse = await app.inject({
    headers: browserHeaders,
    method: "POST",
    url: "/auth/development/application-login"
  });
  assert.equal(loginResponse.statusCode, 200, loginResponse.body);
  const previousCookie = sessionCookie(loginResponse.cookies);

  const freshLoginResponse = await app.inject({
    headers: { ...browserHeaders, cookie: previousCookie },
    method: "POST",
    url: "/auth/development/application-login"
  });
  assert.equal(freshLoginResponse.statusCode, 200, freshLoginResponse.body);
  const freshCookie = sessionCookie(freshLoginResponse.cookies);
  assert.notEqual(freshCookie, previousCookie, "Application login reused the existing session.");

  const brandingResponse = await app.inject({ method: "GET", url: "/public/company-branding" });
  assert.equal(brandingResponse.statusCode, 200, brandingResponse.body);
  assert.ok(brandingResponse.json().data?.brandName, "Default company branding was empty.");
  const rejectedLogo = await app.inject({
    headers: { ...browserHeaders, cookie: freshCookie },
    method: "POST",
    payload: { contentBase64: Buffer.from("not-an-svg").toString("base64"), variant: "logo" },
    url: "/application/media/company-logo"
  });
  assert.notEqual(rejectedLogo.statusCode, 403, rejectedLogo.body);
  assert.equal(rejectedLogo.statusCode, 400, rejectedLogo.body);

  const retiredSessionResponse = await app.inject({
    headers: { ...browserHeaders, cookie: previousCookie },
    method: "GET",
    url: "/auth/session"
  });
  assert.equal(retiredSessionResponse.statusCode, 401, retiredSessionResponse.body);

  const sessionResponse = await app.inject({
    headers: { ...browserHeaders, cookie: freshCookie },
    method: "GET",
    url: "/auth/session"
  });
  assert.equal(sessionResponse.statusCode, 200, sessionResponse.body);
  assert.equal(sessionResponse.json().data?.authenticated, true);

  const setupResponse = await app.inject({
    headers: { ...browserHeaders, cookie: freshCookie },
    method: "GET",
    url: "/application/setup"
  });
  assert.equal(setupResponse.statusCode, 200, setupResponse.body);
  assert.equal(setupResponse.json().data?.application?.databaseName, "cxshop_db");
  assert.ok(
    setupResponse.json().data?.application?.enabledModuleKeys?.includes("ecommerce.catalog")
  );

  const devkitResponse = await app.inject({
    headers: { ...browserHeaders, cookie: freshCookie },
    method: "GET",
    url: "/devkit/admin/platform-registry/result"
  });
  assert.equal(devkitResponse.statusCode, 403, "Application access bypassed DevKit admin access.");

  const taskLookupsResponse = await app.inject({
    headers: { ...browserHeaders, cookie: freshCookie },
    method: "GET",
    url: "/task-manager/lookups"
  });
  assert.equal(taskLookupsResponse.statusCode, 200, taskLookupsResponse.body);

  for (const retiredPath of ["/tenant/runtime", "/devkit/admin/project-manager/result"]) {
    const retiredResponse = await app.inject({
      headers: { ...browserHeaders, cookie: freshCookie },
      method: "GET",
      url: retiredPath
    });
    assert.equal(retiredResponse.statusCode, 404, `${retiredPath} remains registered.`);
  }

  console.info("[e2e.ok] composed standalone CXShop runtime passed", {
    database: "cxshop_db",
    modules: ["core", "billing", "mail", "devkit", "ecommerce", "blogs"]
  });
} finally {
  await app.close();
}

function sessionCookie(cookies: Array<{ name: string; value: string }>) {
  const cookie = cookies.findLast(
    ({ name, value }) => name.endsWith("cxshop_session") && value.length > 0
  );
  assert.ok(cookie, "Application login did not issue a session cookie.");
  return `${cookie.name}=${cookie.value}`;
}
