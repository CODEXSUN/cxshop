import type { PlatformAppId } from "../app-registry/app-registry.types.js";

export type ApplicationSetupRecord = {
  applicationCode: string;
  applicationName: string;
  databaseName: string;
  defaultLandingApp: PlatformAppId;
  enabledModuleKeys: string[];
  id: number;
  status: "active" | "inactive";
  uuid: string;
};

export type ApplicationSetupRuntime = {
  application: ApplicationSetupRecord;
  apps: Array<{
    alwaysEnabled: boolean;
    defaultLanding: boolean;
    description: string;
    enabled: boolean;
    id: PlatformAppId;
    label: string;
    moduleKey: string;
    stack: string;
  }>;
  defaultLandingApp: PlatformAppId;
};
