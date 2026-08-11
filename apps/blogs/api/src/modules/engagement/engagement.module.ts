import { defineModule } from "@cxshop/framework/modules";
import { registerEngagementRoutes } from "./engagement.routes.js";
export const engagementModule = defineModule({
  key: "blogs.engagement",
  label: "Blog engagement",
  register: registerEngagementRoutes
});
