import type {
  StorefrontCatalogFilters,
  StorefrontDiscovery,
  StorefrontProduct,
  StorefrontProductDetail
} from "../storefront/storefront.types.js";

export type CatalogDataSourceProvider = "frappe" | "own";

export const catalogDataSourceModules = [
  "categories",
  "brands",
  "products",
  "product-details",
  "variants",
  "product-images"
] as const;
export type CatalogDataSourceModule = (typeof catalogDataSourceModules)[number];

export type CatalogModuleDataSource = {
  description: string;
  label: string;
  module: CatalogDataSourceModule;
  provider: CatalogDataSourceProvider;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type CatalogDataSourceSettings = {
  appKeyConfigured: boolean;
  appSecretConfigured: boolean;
  connectionName: string;
  frappeConfigured: boolean;
  frappeEnabled: boolean;
  frappeUrl: string | null;
  lastVerifiedAt: string | null;
  modules: CatalogModuleDataSource[];
  saveToEnvironment: boolean;
  verificationStatus: "live" | "offline" | "unverified";
  verifiedUser: string | null;
};

export type CatalogDataSourceConnectionSettings = Omit<CatalogDataSourceSettings, "modules">;

export type CatalogDataSourceConnectionResult = {
  connected: boolean;
  latencyMs: number;
  message: string;
  provider: CatalogDataSourceProvider;
  providerLabel: string;
};

export type FrappeCatalogCredentials = { apiKey: string; apiSecret: string; url: string };

export type FrappeConnectionPayload = {
  apiKey?: string;
  apiSecret?: string;
  connectionName: string;
  enabled: boolean;
  saveToEnvironment: boolean;
  url: string;
};

export type FrappeVerificationPayload = Pick<
  FrappeConnectionPayload,
  "apiKey" | "apiSecret" | "url"
>;

export type FrappeErpItem = {
  brand?: string | null;
  description?: string | null;
  disabled?: number;
  image?: string | null;
  is_stock_item?: number;
  item_code: string;
  item_group?: string | null;
  item_name: string;
  modified?: string | null;
  standard_rate?: number | string | null;
  stock_uom?: string | null;
};

export type FrappeIShopItem = {
  availability?: string | null;
  brand?: string | null;
  erpnext_item?: string | null;
  full_description?: string | null;
  highlights?: string | null;
  image?: string | null;
  item_code: string;
  item_group?: string | null;
  item_name: string;
  mrp?: number | string | null;
  modified?: string | null;
  name?: string;
  published?: number;
  short_description?: string | null;
  web_price?: number | string | null;
};

export type FrappeIShopCatalog = {
  catalog_code: string;
  catalog_image?: string | null;
  catalog_items?: Array<{ display_order?: number; ishop_item: string }>;
  catalog_name: string;
  description?: string | null;
  modified?: string | null;
  name?: string;
  published?: number;
};

export type FrappeCatalogSnapshot = {
  catalogs: FrappeIShopCatalog[];
  erpnext_items: FrappeErpItem[];
  items: FrappeIShopItem[];
};

export type CatalogSyncResult = {
  catalogs: number;
  direction: "frappe-to-own" | "own-to-frappe";
  erpnextItems: number;
  items: number;
  message: string;
};

export type CatalogDataSourceControl = {
  credentials(): Promise<FrappeCatalogCredentials>;
  save(
    input: FrappeConnectionPayload,
    actorEmail: string
  ): Promise<CatalogDataSourceConnectionSettings>;
  settings(): Promise<CatalogDataSourceConnectionSettings>;
  test(provider: CatalogDataSourceProvider): Promise<CatalogDataSourceConnectionResult>;
  verify(input: FrappeVerificationPayload): Promise<CatalogDataSourceConnectionResult>;
};

export interface StorefrontCatalogSource {
  catalog(filters: StorefrontCatalogFilters): Promise<StorefrontProduct[]>;
  categories(): Promise<StorefrontDiscovery["categories"]>;
  discovery(): Promise<StorefrontDiscovery>;
  product(slug: string): Promise<StorefrontProductDetail | null>;
}
