import { PortalShell } from "@cxshop/ui";
export const metadata = { title: "Customer account", robots: { index: false } };
export default function Account() { return <PortalShell accent="#b45b2b" eyebrow="Customer account" title="Welcome back"><section className="surface"><h2>Your commerce home</h2><p>Orders, returns, saved products, addresses, and account security belong here.</p></section></PortalShell>; }
