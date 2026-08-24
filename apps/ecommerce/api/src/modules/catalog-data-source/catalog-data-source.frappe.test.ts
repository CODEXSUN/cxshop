import assert from "node:assert/strict";
import test from "node:test";
import { FrappeCatalogSource } from "./catalog-data-source.frappe.js";

test("maps the LogicX iShop 1.0.9 snapshot into published storefront products", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input) => {
    assert.match(String(input), /logicx_ishop\.api\.catalog_sync\.get_catalog_snapshot/u);
    return Response.json({
      message: {
        catalogs: [
          {
            catalog_code: "LAPTOPS",
            catalog_items: [{ display_order: 1, ishop_item: "WEB-1" }],
            catalog_name: "Laptops",
            published: 1
          },
          {
            catalog_code: "HIDDEN",
            catalog_items: [{ display_order: 1, ishop_item: "DRAFT-1" }],
            catalog_name: "Hidden",
            published: 0
          }
        ],
        erpnext_items: [
          {
            brand: "LogicX",
            image: "/files/web-1.png",
            item_code: "ERP-1",
            item_group: "Computers",
            item_name: "ERP product",
            standard_rate: 49990
          }
        ],
        items: [
          {
            erpnext_item: "ERP-1",
            item_code: "WEB-1",
            item_name: "Published laptop",
            name: "WEB-1",
            published: 1,
            short_description: "Ready for work"
          },
          {
            item_code: "DRAFT-1",
            item_name: "Draft laptop",
            name: "DRAFT-1",
            published: 0
          }
        ],
        sliders: [
          {
            action_label: "Shop now",
            action_url: "/shop/product/web-1",
            description: "Featured laptop",
            display_order: 10,
            eyebrow: "New arrival",
            image_url: "/files/hero.png",
            ishop_item: "WEB-1",
            published: 1,
            slider_code: "HOME-01",
            title: "Laptop season"
          }
        ]
      }
    });
  };

  const source = new FrappeCatalogSource(async () => ({
    apiKey: "test-key",
    apiSecret: "test-secret",
    url: "https://ishop.example.test"
  }));
  const products = await source.catalog({});

  assert.equal(products.length, 1);
  assert.deepEqual(products[0], {
    brand: "LogicX",
    category: "Laptops",
    compareAtPrice: null,
    description: "",
    featured: true,
    featuredOrder: 1,
    imageAlt: "Published laptop",
    imageUrl: "https://ishop.example.test/files/web-1.png",
    name: "Published laptop",
    price: 49990,
    shortDescription: "Ready for work",
    slug: "web-1",
    subtitle: "",
    variantCount: 0
  });
  assert.deepEqual(await source.sliders(), [
    {
      actionLabel: "Shop now",
      actionUrl: "/shop/product/web-1",
      description: "Featured laptop",
      displayOrder: 10,
      eyebrow: "New arrival",
      imageAlt: "Laptop season",
      imageUrl: "https://ishop.example.test/files/hero.png",
      linkedItem: "WEB-1",
      sliderCode: "HOME-01",
      title: "Laptop season"
    }
  ]);
});
