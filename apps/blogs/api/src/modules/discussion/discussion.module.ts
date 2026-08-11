import { defineModule } from "@cxshop/framework/modules";
import { registerDiscussionRoutes } from "./discussion.routes.js";
export const discussionModule = defineModule({
  key: "blogs.discussion",
  label: "Blog discussions",
  register: registerDiscussionRoutes
});
