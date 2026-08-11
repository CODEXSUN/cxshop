import { defineModule } from "@cxshop/framework/modules";
import { registerTaxonomyRoutes } from "./taxonomy.routes.js";
export const taxonomyModule = defineModule({
  key: "blogs.taxonomy",
  label: "Blog taxonomy",
  register: registerTaxonomyRoutes
});
