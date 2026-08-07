import { Boxes, CircleDollarSign, LayoutDashboard, PackageCheck, RotateCcw, Store, Truck, Warehouse } from "lucide-react";
import type { PortalNavGroup } from "@cxshop/ui";
export const vendorNavigation: PortalNavGroup[] = [
  { label: "Seller workspace", items: [{ label: "Overview", href: "/vendor", icon: LayoutDashboard, active: true }, { label: "Product offers", href: "/vendor#offers", icon: Store }, { label: "Inventory", href: "/vendor#inventory", icon: Warehouse }, { label: "Orders", href: "/vendor#orders", icon: Boxes }] },
  { label: "Fulfilment and finance", items: [{ label: "Shipments", href: "/vendor#shipments", icon: Truck }, { label: "Returns", href: "/vendor#returns", icon: RotateCcw }, { label: "Settlements", href: "/vendor#settlements", icon: CircleDollarSign }, { label: "Store quality", href: "/vendor#quality", icon: PackageCheck }] }
];
export const vendorUser = { name: "Demo Vendor", email: "vendor@cxshop.local", initials: "DV" };
