import { PortalShell } from "@cxshop/ui";
import { accountNavigation, customerUser } from "../../src/modules/customer/portal/account-navigation";
export const metadata = { title: "Customer account", robots: { index: false } };
export default function Account() { return <PortalShell eyebrow="Customer account" navigation={accountNavigation} portalName="Customer Account" title="Welcome back" user={customerUser}><section className="surface"><h2>Your commerce home</h2><p>Orders, returns, saved products, addresses, and account security belong here.</p></section></PortalShell>; }
