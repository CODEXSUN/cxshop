import { PortalShell } from "@cxshop/ui";
import { BusinessAssistPage } from "../../business-assist/portal/business-assist-page";
import { superAdminNavigation, superAdminUser } from "./super-admin-navigation";

export function SuperAdminBusinessAssist() {
  return <PortalShell eyebrow="OpenAI integration" navigation={superAdminNavigation("assist")} portalName="Super Admin" title="Business Assist" user={superAdminUser}><BusinessAssistPage/></PortalShell>;
}
