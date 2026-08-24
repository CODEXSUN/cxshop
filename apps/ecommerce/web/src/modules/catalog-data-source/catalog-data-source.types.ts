export type CatalogDataSourceProvider = "frappe" | "own";
export type CatalogDataSourceModule =
  | "categories"
  | "brands"
  | "products"
  | "product-details"
  | "variants"
  | "product-images"
  | "sliders"
  | "promotions"
  | "featured-cards";
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

export type FrappeConnectionPayload = {
  apiKey?: string;
  apiSecret?: string;
  connectionName: string;
  enabled: boolean;
  saveToEnvironment: true;
  url: string;
};

export type FrappeVerificationPayload = Pick<
  FrappeConnectionPayload,
  "apiKey" | "apiSecret" | "url"
>;

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
  sliders: number;
  promotions: number;
  featuredCards: number;
  message: string;
};
