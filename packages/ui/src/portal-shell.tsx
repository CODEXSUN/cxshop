import { Bell, ChevronDown, LogOut, Menu, Search, Store, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PortalNavItem = { active?: boolean; href: string; icon: LucideIcon; label: string };
export type PortalNavGroup = { items: PortalNavItem[]; label: string };

type PortalShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  navigation: PortalNavGroup[];
  portalName: string;
  title: string;
  user: { email: string; initials: string; name: string };
};

export function PortalShell({ actions, children, eyebrow, navigation, portalName, title, user }: PortalShellProps) {
  return <div className="bo-shell">
    <aside className="bo-sidebar">
      <a className="bo-brand" href="/"><span><img alt="" src="/logo/logo.svg"/></span><div><strong>CXShop</strong><small>{portalName}</small></div><ChevronDown size={15}/></a>
      <nav aria-label={`${portalName} navigation`}>{navigation.map(group => <section key={group.label}><p>{group.label}</p>{group.items.map(item => <a aria-current={item.active ? "page" : undefined} className={item.active ? "active" : ""} href={item.href} key={item.href}><item.icon size={17}/><span>{item.label}</span></a>)}</section>)}</nav>
      <footer><span className="bo-version">CXShop v1.1.1</span><details><summary><span className="bo-avatar">{user.initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><ChevronDown size={15}/></summary><div className="bo-user-menu"><a href="/"><Store size={16}/>Storefront</a><a href="/logout"><LogOut size={16}/>Sign out</a></div></details></footer>
    </aside>
    <div className="bo-workspace">
      <header className="bo-topbar"><details className="bo-mobile-menu"><summary aria-label="Open navigation"><Menu size={20}/></summary><nav>{navigation.flatMap(group => group.items).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</nav></details><p>{portalName}</p><div><button aria-label="Search" type="button"><Search size={18}/></button><button aria-label="Notifications" type="button"><Bell size={18}/></button><span className="bo-top-avatar">{user.initials}</span></div></header>
      <main className="bo-main"><header className="bo-page-header"><div><p>{eyebrow}</p><h1>{title}</h1></div>{actions}</header>{children}</main>
    </div>
    <details className="bo-tweak"><summary>Display</summary><label><input defaultChecked name="density" type="radio"/>Comfortable</label><label><input id="density-compact" name="density" type="radio"/>Compact</label></details>
  </div>;
}

export function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}
