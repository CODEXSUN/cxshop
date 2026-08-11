import { defineModule } from "@cxshop/framework/modules";
import { registerArticleRoutes } from "./article.routes.js";
export const articleModule = defineModule({
  key: "blogs.article",
  label: "Blog articles",
  register: registerArticleRoutes
});
