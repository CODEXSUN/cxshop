import { Heart, LayoutDashboard, MapPin, Package, RotateCcw, ShieldCheck } from "lucide-react";
import type { PortalNavGroup } from "@cxshop/ui";
export const accountNavigation: PortalNavGroup[] = [
  { label: "Your account", items: [{ label: "Overview", href: "/account", icon: LayoutDashboard, active: true }, { label: "Orders", href: "/account#orders", icon: Package }, { label: "Returns", href: "/account#returns", icon: RotateCcw }, { label: "Saved products", href: "/account#saved", icon: Heart }] },
  { label: "Profile", items: [{ label: "Addresses", href: "/account#addresses", icon: MapPin }, { label: "Security", href: "/account#security", icon: ShieldCheck }] }
];
export const customerUser = { name: "Demo Customer", email: "customer@cxshop.local", initials: "DC" };
