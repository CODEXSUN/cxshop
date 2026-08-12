import { AppError } from "@cxshop/framework/errors";
import { StorefrontRepository } from "../storefront/storefront.repository.js";
import type { StorefrontCatalogFilters } from "../storefront/storefront.types.js";
import { FrappeCatalogSource } from "./catalog-data-source.frappe.js";
import { CatalogDataSourceRepository } from "./catalog-data-source.repository.js";
import type {
  CatalogDataSourceModule,
  CatalogSyncResult,
  CatalogDataSourceControl,
  CatalogDataSourceProvider,
  StorefrontCatalogSource
} from "./catalog-data-source.types.js";

class OwnCatalogSource implements StorefrontCatalogSource {
  constructor(private readonly repository = new StorefrontRepository()) {}
  catalog(filters: StorefrontCatalogFilters) {
    return this.repository.list(filters);
  }
  categories() {
    return this.repository.categories();
  }
  discovery() {
    return this.repository.discovery();
  }
  product(slug: string) {
    return this.repository.find(slug);
  }
}

export class CatalogDataSourceService implements StorefrontCatalogSource {
  private readonly own = new OwnCatalogSource();
  private readonly frappe: FrappeCatalogSource;

  constructor(
    private readonly control: CatalogDataSourceControl,
    private readonly repository = new CatalogDataSourceRepository()
  ) {
    this.frappe = new FrappeCatalogSource(() => control.credentials());
  }

  async pullFromFrappe(): Promise<CatalogSyncResult> {
    const snapshot = await this.frappe.integrationSnapshot();
    await this.repository.replaceFromFrappe(snapshot);
    return syncResult("frappe-to-own", snapshot, "Frappe catalog was synchronized to CXShop.");
  }

  async pushToFrappe(): Promise<CatalogSyncResult> {
    const snapshot = await this.repository.snapshot();
    await this.frappe.upsert(snapshot);
    await this.repository.recordPush(snapshot);
    return syncResult("own-to-frappe", snapshot, "CXShop catalog was synchronized to Frappe.");
  }

  async seedDemoInFrappe(): Promise<CatalogSyncResult> {
    await this.frappe.seedDemo();
    return this.pullFromFrappe();
  }

  frappeItems(search: string) {
    return this.frappe.itemLookup(search);
  }

  frappeItem(itemCode: string) {
    return this.frappe.item(itemCode);
  }

  async settings() {
    const [connection, modules] = await Promise.all([
      this.control.settings(),
      this.repository.moduleProviders()
    ]);
    return {
      ...connection,
      modules: modules.map((module) => ({ ...module, ...moduleDefinition(module.module) }))
    };
  }

  async switchProvider(
    module: CatalogDataSourceModule,
    provider: CatalogDataSourceProvider,
    actorEmail: string
  ) {
    const connection = await this.control.settings();
    if (provider === "frappe" && !connection.frappeConfigured) {
      throw AppError.validation(
        "Configure and verify the Frappe connection before selecting Frappe Live."
      );
    }
    await this.repository.saveModuleProvider(module, provider, actorEmail);
    return this.settings();
  }

  async test(provider: CatalogDataSourceProvider) {
    const result = await this.control.test(provider);
    if (provider !== "frappe" || !result.connected) return result;
    const started = Date.now();
    try {
      const products = await this.frappe.catalog({});
      return {
        ...result,
        latencyMs: result.latencyMs + Date.now() - started,
        message: `Frappe iShop catalog is ready with ${products.length} published products.`
      };
    } catch (error) {
      return {
        ...result,
        connected: false,
        latencyMs: result.latencyMs + Date.now() - started,
        message: error instanceof Error ? error.message : "Frappe iShop catalog access failed."
      };
    }
  }

  async catalog(filters: StorefrontCatalogFilters) {
    return (await this.source("products")).catalog(filters);
  }

  async categories() {
    return (await this.source("categories")).categories();
  }

  async discovery() {
    const [productDiscovery, categories, brandDiscovery] = await Promise.all([
      (await this.source("products")).discovery(),
      (await this.source("categories")).categories(),
      (await this.source("brands")).discovery()
    ]);
    return { ...productDiscovery, brands: brandDiscovery.brands, categories };
  }

  async product(slug: string) {
    const [details, variants, images] = await Promise.all([
      (await this.source("product-details")).product(slug),
      (await this.source("variants")).product(slug),
      (await this.source("product-images")).product(slug)
    ]);
    if (!details) return null;
    return {
      ...details,
      imageAlt: images?.imageAlt ?? details.imageAlt,
      imageUrl: images?.imageUrl ?? details.imageUrl,
      variantCount: variants?.variantCount ?? details.variantCount,
      variants: variants?.variants ?? details.variants
    };
  }

  private async source(module: CatalogDataSourceModule) {
    const providers = await this.repository.moduleProviders();
    return providers.find((item) => item.module === module)?.provider === "frappe"
      ? this.frappe
      : this.own;
  }
}

function moduleDefinition(module: CatalogDataSourceModule) {
  return {
    categories: { description: "Storefront category navigation and filters.", label: "Categories" },
    brands: { description: "Brand discovery, filters, and storefront groups.", label: "Brands" },
    products: {
      description: "Product lists, storefront search, prices, and discovery.",
      label: "Products & search"
    },
    "product-details": {
      description: "Product page content, policies, and highlights.",
      label: "Product details"
    },
    variants: {
      description: "Product variants, SKU choices, and variant prices.",
      label: "Variants"
    },
    "product-images": {
      description: "Primary storefront product images and alternative text.",
      label: "Product images"
    }
  }[module];
}

function syncResult(
  direction: CatalogSyncResult["direction"],
  snapshot: Awaited<ReturnType<FrappeCatalogSource["integrationSnapshot"]>>,
  message: string
): CatalogSyncResult {
  return {
    catalogs: snapshot.catalogs.length,
    direction,
    erpnextItems: snapshot.erpnext_items.length,
    items: snapshot.items.length,
    message
  };
}
