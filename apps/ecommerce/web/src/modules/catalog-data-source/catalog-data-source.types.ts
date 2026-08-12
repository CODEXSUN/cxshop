export type CatalogDataSourceProvider = "frappe" | "own";
export type CatalogDataSourceModule =
  "categories" | "brands" | "products" | "product-details" | "variants" | "product-images";
export type CatalogModuleDataSource = {
  description: string;
  label: string;
  module: CatalogDataSourceModule;
  provider: CatalogDataSourceProvider;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type CatalogDataSourceSettings = {
  frappeConfigured: boolean;
  frappeUrl: string | null;
  lastVerifiedAt: string | null;
  modules: CatalogModuleDataSource[];
  verificationStatus: "live" | "offline" | "unverified";
};

export type CatalogDataSourceConnectionResult = {
  connected: boolean;
  latencyMs: number;
  message: string;
  provider: CatalogDataSourceProvider;
  providerLabel: string;
};

export type CatalogSyncResult = {
  catalogs: number;
  direction: "frappe-to-own" | "own-to-frappe";
  erpnextItems: number;
  items: number;
  message: string;
};
