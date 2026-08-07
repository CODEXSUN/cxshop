import { PortalShell } from "@cxshop/ui";
import { WalkInOrders } from "../../../src/modules/admin/orders/walk-in-orders";
import { adminNavigation, adminUser } from "../../../src/modules/admin/portal/admin-navigation";
export const metadata={title:"Walk-in orders",robots:{index:false}};
export default function OrdersPage(){return <PortalShell eyebrow="Enquiry to collection" navigation={adminNavigation("orders")} portalName="Admin Desk" title="Walk-in orders" user={adminUser}><WalkInOrders/></PortalShell>;}
