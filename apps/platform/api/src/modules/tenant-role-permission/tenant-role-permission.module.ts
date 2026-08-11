import { defineModule } from "@cxshop/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerTenantRolePermissionRoutes } from "./tenant-role-permission.routes.js";
export const tenantRolePermissionModule = defineModule<PlatformModuleDependencies>({
  key: "platform.application-role-permission",
  label: "Role Permissions",
  register: ({ app }) => registerTenantRolePermissionRoutes(app)
});
