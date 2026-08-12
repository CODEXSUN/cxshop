import { defineModule } from "@cxshop/framework/modules";
import type { DevkitModuleDependencies } from "../../module-dependencies.js";
import { registerHoneyRoutes } from "./honey.routes.js";

export const honeyModule = defineModule<DevkitModuleDependencies>({
  key: "devkit.honey",
  label: "Piko AI Assistant",
  register: ({ app }) => registerHoneyRoutes(app)
});
