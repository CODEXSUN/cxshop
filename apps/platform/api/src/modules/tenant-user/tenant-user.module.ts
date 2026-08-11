import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerTenantUserRoutes } from "./tenant-user.routes.js";
export const tenantUserModule = defineModule<PlatformModuleDependencies>({
  key: "platform.application-user",
  label: "Users",
  register: ({ app }) => registerTenantUserRoutes(app)
});
