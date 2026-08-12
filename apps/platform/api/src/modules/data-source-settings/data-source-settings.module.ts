import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerDataSourceSettingsRoutes } from "./data-source-settings.routes.js";
export const dataSourceSettingsModule = defineModule<PlatformModuleDependencies>({
  key: "platform.data-source-settings",
  label: "Data Source Settings",
  register: ({ app }) => registerDataSourceSettingsRoutes(app)
});
