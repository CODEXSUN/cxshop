import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerApplicationSetupRoutes } from "./application-setup.routes.js";

export const applicationSetupModule = defineModule<PlatformModuleDependencies>({
  key: "platform.application-setup",
  label: "Application Setup",
  register({ app }) {
    return registerApplicationSetupRoutes(app);
  }
});
