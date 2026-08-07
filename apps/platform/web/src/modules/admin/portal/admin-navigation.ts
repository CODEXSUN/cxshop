import { Boxes, CircleDollarSign, Headphones, LayoutDashboard, PackageSearch, Scale, ShieldAlert, Store } from "lucide-react";
import type { PortalNavGroup } from "@cxshop/ui";
export function adminNavigation(active: "catalog" | "orders" | "assist" = "catalog"): PortalNavGroup[] { return [
  { label: "Marketplace", items: [{ label: "Overview", href: "/admin#overview", icon: LayoutDashboard }, { label: "Catalog", href: "/admin", icon: PackageSearch, active: active === "catalog" }, { label: "Vendors", href: "/admin#vendors", icon: Store }, { label: "Walk-in orders", href: "/admin/orders", icon: Boxes, active: active === "orders" }] },
  { label: "Operations", items: [{ label: "Payments", href: "/admin#payments", icon: CircleDollarSign }, { label: "Disputes", href: "/admin#disputes", icon: Scale }, { label: "Risk review", href: "/admin#risk", icon: ShieldAlert }, { label: "Business Assist", href: "/admin/assist", icon: Headphones, active: active === "assist" }] }
]; }
export const adminUser = { name: "Marketplace Admin", email: "admin@cxshop.local", initials: "MA" };
