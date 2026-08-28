export type ApplicationSetupRuntime = {
  application: {
    applicationCode: string;
    applicationName: string;
    databaseName: string;
    defaultLandingApp: "application" | "billing" | "blogs" | "ecommerce" | "file-manager" | "mail" | "task-manager";
    enabledModuleKeys: string[];
    id: number;
    status: "active" | "inactive";
    uuid: string;
  };
  apps: Array<{
    alwaysEnabled: boolean;
    defaultLanding: boolean;
    description: string;
    enabled: boolean;
    id: "application" | "billing" | "blogs" | "ecommerce" | "file-manager" | "mail" | "task-manager";
    label: string;
    moduleKey: string;
    stack: string;
  }>;
  defaultLandingApp: "application" | "billing" | "blogs" | "ecommerce" | "file-manager" | "mail" | "task-manager";
};
