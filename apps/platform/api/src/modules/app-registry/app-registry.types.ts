export type PlatformAppId =
  "application" | "billing" | "blogs" | "devkit" | "ecommerce" | "file-manager" | "mail" | "task-manager";

export type PlatformAppDefinition = {
  alwaysEnabled: boolean;
  defaultLanding: boolean;
  description: string;
  id: number;
  appId: PlatformAppId;
  label: string;
  moduleKey: string;
  stack:
    "platform" | "billing" | "blogs" | "devkit" | "ecommerce" | "mail" | "platform-task-manager";
  uuid: string;
};

export type PlatformAppSavePayload = Omit<PlatformAppDefinition, "id" | "uuid">;
