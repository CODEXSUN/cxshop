import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerTenantRoleRoutes } from "./tenant-role.routes.js";
export const tenantRoleModule = defineModule<PlatformModuleDependencies>({
  key: "platform.application-role",
  label: "Roles",
  register: ({ app }) => registerTenantRoleRoutes(app)
});
