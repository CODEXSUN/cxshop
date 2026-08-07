import { Activity, Bot, Database, Gauge, KeyRound, LayoutDashboard, ListRestart, PlugZap, ScrollText } from "lucide-react";
import type { PortalNavGroup } from "@cxshop/ui";
export function superAdminNavigation(active: "overview" | "assist" = "overview"): PortalNavGroup[] { return [
  { label: "Control plane", items: [{ label: "Overview", href: "/sa", icon: LayoutDashboard, active: active === "overview" }, { label: "Runtime", href: "/sa#runtime", icon: Gauge }, { label: "Access", href: "/sa#access", icon: KeyRound }, { label: "Audit", href: "/sa#audit", icon: ScrollText }] },
  { label: "Platform services", items: [{ label: "Database", href: "/sa#database", icon: Database }, { label: "Queues", href: "/sa#queues", icon: ListRestart }, { label: "Integrations", href: "/sa#integrations", icon: PlugZap }, { label: "Activity", href: "/sa#activity", icon: Activity }, { label: "Business Assist", href: "/sa/assist", icon: Bot, active: active === "assist" }] }
]; }
export const superAdminUser = { name: "System Super Admin", email: "sa@cxshop.local", initials: "SA" };
