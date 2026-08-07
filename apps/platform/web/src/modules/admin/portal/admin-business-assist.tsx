import { PortalShell } from "@cxshop/ui";
import { BusinessAssistPage } from "../../business-assist/portal/business-assist-page";
import { adminNavigation, adminUser } from "./admin-navigation";

export function AdminBusinessAssist() {
  return <PortalShell eyebrow="OpenAI integration" navigation={adminNavigation("assist")} portalName="Admin Desk" title="Business Assist" user={adminUser}><BusinessAssistPage/></PortalShell>;
}
