export type DataSourceProvider = "frappe" | "own";
export type DataSourceSettings = {
  appKeyConfigured: boolean;
  appSecretConfigured: boolean;
  availableProviders: DataSourceProvider[];
  envProvider: DataSourceProvider;
  connectionName: string;
  frappeConfigured: boolean;
  frappeEnabled: boolean;
  frappeUrl: string | null;
  lastCheckedAt: string | null;
  lastVerifiedAt: string | null;
  provider: DataSourceProvider;
  providerLabel: string;
  updatedAt: string | null;
  updatedBy: string;
  saveToEnvironment: boolean;
  verificationStatus: "live" | "offline" | "unverified";
  verifiedUser: string | null;
};
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
export type DataSourceConnectionResult = {
  connected: boolean;
  latencyMs: number;
  message: string;
  provider: DataSourceProvider;
  providerLabel: string;
};
