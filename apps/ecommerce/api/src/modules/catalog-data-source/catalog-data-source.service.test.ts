import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "@cxshop/framework/errors";
import { isFrappeOperatingWindow } from "./catalog-data-source.availability.js";
import { CatalogDataSourceService } from "./catalog-data-source.service.js";

test("storefront falls back to local catalog and resumes Frappe after recovery", async () => {
  let frappeCalls = 0;
  const localProducts = [{ name: "Cached product" }];
  const liveProducts = [{ name: "Live product" }];
  const repository = {
    moduleProviders: async () => [{ module: "products", provider: "frappe" }]
  };
  const service = new CatalogDataSourceService(
    {} as ConstructorParameters<typeof CatalogDataSourceService>[0],
    repository as ConstructorParameters<typeof CatalogDataSourceService>[1],
    () => new Date("2026-08-14T04:00:00.000Z")
  );
  Object.assign(service as object, {
    frappe: {
      catalog: async () => {
        frappeCalls += 1;
        if (frappeCalls === 1) {
          throw new AppError({
            code: "FRAPPE_CATALOG_UNAVAILABLE",
            message: "Frappe is offline.",
            statusCode: 502
          });
        }
        return liveProducts;
      }
    },
    fallback: { catalog: async () => localProducts },
    own: { catalog: async () => localProducts }
  });

  assert.equal((await service.catalog({}))[0]?.name, "Cached product");
  assert.equal((await service.catalog({}))[0]?.name, "Cached product");
  assert.equal(frappeCalls, 1);

  Object.assign(service as object, { frappeRetryAfter: 0 });
  assert.equal((await service.catalog({}))[0]?.name, "Live product");
  assert.equal(frappeCalls, 2);

  Object.assign(service as object, { now: () => new Date("2026-08-14T17:00:00.000Z") });
  assert.equal((await service.catalog({}))[0]?.name, "Cached product");
  assert.equal(frappeCalls, 2);
});

test("scheduled Frappe refresh runs only from 8 AM until 10 PM India time", () => {
  assert.equal(isFrappeOperatingWindow(new Date("2026-08-14T02:29:00.000Z")), false);
  assert.equal(isFrappeOperatingWindow(new Date("2026-08-14T02:30:00.000Z")), true);
  assert.equal(isFrappeOperatingWindow(new Date("2026-08-14T16:29:00.000Z")), true);
  assert.equal(isFrappeOperatingWindow(new Date("2026-08-14T16:30:00.000Z")), false);
});

test("empty Frappe cache falls back to the complete local catalog", async () => {
  const repository = {
    moduleProviders: async () => [{ module: "products", provider: "frappe" }]
  };
  const service = new CatalogDataSourceService(
    {} as ConstructorParameters<typeof CatalogDataSourceService>[0],
    repository as ConstructorParameters<typeof CatalogDataSourceService>[1],
    () => new Date("2026-08-14T17:00:00.000Z")
  );
  Object.assign(service as object, {
    fallback: { catalog: async () => [] },
    own: { catalog: async () => [{ name: "Available local product" }] }
  });

  assert.equal((await service.catalog({}))[0]?.name, "Available local product");
});
