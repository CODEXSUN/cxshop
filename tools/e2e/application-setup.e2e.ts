import assert from "node:assert/strict";
import { createApp } from "../../apps/platform/api/src/app.js";

const app = await createApp();
try {
  const login = await app.inject({
    headers: {
      host: "app.codexsun.test",
      origin: "http://app.codexsun.test"
    },
    method: "POST",
    url: "/auth/development/application-login"
  });
  assert.equal(login.statusCode, 200, login.body);
  const cookie = String(login.headers["set-cookie"] ?? "").split(";")[0];
  assert.ok(cookie, "Development application login did not return a session cookie.");

  const setup = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "GET",
    url: "/application/setup"
  });
  assert.equal(setup.statusCode, 200, setup.body);
  const body = setup.json() as {
    data: {
      application: { applicationCode: string; databaseName: string; enabledModuleKeys: string[] };
    };
  };
  assert.equal(body.data.application.applicationCode, "CXSHOP");
  assert.equal(body.data.application.databaseName, "cxshop_db");
  assert.ok(body.data.application.enabledModuleKeys.includes("ecommerce.catalog"));

  for (const url of ["/core/organisation/companies", "/core/organisation/financial-years"]) {
    const response = await app.inject({
      headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
      method: "GET",
      url
    });
    assert.equal(response.statusCode, 200, `${url}: ${response.body}`);
  }

  const defaultCompanyResponse = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "GET",
    url: "/core/organisation/default-company"
  });
  assert.equal(defaultCompanyResponse.statusCode, 200, defaultCompanyResponse.body);
  const defaultCompany = defaultCompanyResponse.json() as {
    data: { companyId: number; financialYearId: number };
  };
  const billingDashboard = await app.inject({
    headers: {
      cookie,
      host: "app.codexsun.test",
      origin: "http://app.codexsun.test",
      "x-company-id": String(defaultCompany.data.companyId),
      "x-financial-year-id": String(defaultCompany.data.financialYearId)
    },
    method: "GET",
    url: "/billing/dashboard"
  });
  assert.equal(billingDashboard.statusCode, 200, billingDashboard.body);

  const brandName = `E2E Storefront Brand ${Date.now()}`;
  const brandPayload = {
    isActive: true,
    logoAlt: "E2E storefront brand logo",
    logoUrl: "https://cdn.simpleicons.org/simpleicons/111827",
    name: brandName,
    showOnStorefront: true,
    sortOrder: 9999
  };
  const createdBrandResponse = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "POST",
    payload: brandPayload,
    url: "/core/common/products/brands"
  });
  assert.equal(createdBrandResponse.statusCode, 200, createdBrandResponse.body);
  const createdBrand = createdBrandResponse.json() as {
    data: { id: number; logoUrl: string; showOnStorefront: boolean };
  };
  assert.equal(createdBrand.data.logoUrl, brandPayload.logoUrl);
  assert.equal(createdBrand.data.showOnStorefront, true);

  const updatedBrandResponse = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "PUT",
    payload: { ...brandPayload, logoAlt: "Updated E2E logo", showOnStorefront: false },
    url: `/core/common/products/brands/${createdBrand.data.id}`
  });
  assert.equal(updatedBrandResponse.statusCode, 200, updatedBrandResponse.body);
  const updatedBrand = updatedBrandResponse.json() as {
    data: { logoAlt: string; showOnStorefront: boolean };
  };
  assert.equal(updatedBrand.data.logoAlt, "Updated E2E logo");
  assert.equal(updatedBrand.data.showOnStorefront, false);

  const deletedBrandResponse = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "DELETE",
    url: `/core/common/products/brands/${createdBrand.data.id}/force`
  });
  assert.equal(deletedBrandResponse.statusCode, 200, deletedBrandResponse.body);

  const storefront = await app.inject({ method: "GET", url: "/storefront/catalog" });
  assert.equal(storefront.statusCode, 200, storefront.body);
  const storefrontBody = storefront.json() as { data: Array<{ imageUrl: string; slug: string }> };
  assert.ok(storefrontBody.data.length >= 8, "The computer catalog seed is incomplete.");
  assert.ok(storefrontBody.data.every((product) => product.imageUrl.startsWith("https://")));

  const discovery = await app.inject({ method: "GET", url: "/storefront/discovery" });
  assert.equal(discovery.statusCode, 200, discovery.body);
  const discoveryBody = discovery.json() as {
    data: {
      brands: Array<{ logoAlt: string; logoUrl: string; name: string }>;
      categories: Array<{ name: string }>;
      priceRange: { maximum: number; minimum: number };
    };
  };
  assert.ok(discoveryBody.data.brands.some((brand) => brand.name === "Logitech"));
  assert.ok(
    discoveryBody.data.brands.some(
      (brand) => brand.name === "Acer" && brand.logoUrl.startsWith("https://")
    ),
    "The storefront discovery response did not include the seeded Acer logo."
  );
  assert.ok(discoveryBody.data.categories.some((category) => category.name === "Laptops"));
  assert.ok(discoveryBody.data.priceRange.maximum > discoveryBody.data.priceRange.minimum);

  const filteredCatalog = await app.inject({
    method: "GET",
    url: "/storefront/catalog?search=mouse&scope=all&brand=Logitech&sort=price-asc"
  });
  assert.equal(filteredCatalog.statusCode, 200, filteredCatalog.body);
  const filteredBody = filteredCatalog.json() as { data: Array<{ brand: string; name: string }> };
  assert.equal(filteredBody.data.length, 1);
  assert.equal(filteredBody.data[0]?.brand, "Logitech");
  assert.match(filteredBody.data[0]?.name ?? "", /mouse/i);

  const retired = await app.inject({
    headers: { cookie, host: "app.codexsun.test", origin: "http://app.codexsun.test" },
    method: "GET",
    url: "/tenant/runtime"
  });
  assert.equal(retired.statusCode, 404);
  console.info(
    "[e2e.ok] standalone application, Core, and Billing use cxshop_db without tenant headers"
  );
} finally {
  await app.close();
}
