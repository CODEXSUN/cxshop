import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerTenantUserRoleRoutes } from "./tenant-user-role.routes.js";
export const tenantUserRoleModule = defineModule<PlatformModuleDependencies>({
  key: "platform.application-user-role",
  label: "User Roles",
  register: ({ app }) => registerTenantUserRoleRoutes(app)
});
