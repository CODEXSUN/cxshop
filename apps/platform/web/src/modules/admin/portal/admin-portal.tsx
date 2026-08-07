import { PortalShell } from "@cxshop/ui";
import { CatalogManager } from "../catalog/catalog-manager";
import { adminNavigation, adminUser } from "./admin-navigation";
export function AdminPortal() { return <PortalShell eyebrow="Marketplace administration" navigation={adminNavigation()} portalName="Admin Desk" title="Catalog" user={adminUser}><CatalogManager/></PortalShell>; }
