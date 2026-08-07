import { Activity, Boxes, LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type PortalShellProps = {
  accent: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function PortalShell({ accent, eyebrow, title, children }: PortalShellProps) {
  return <div className="shell" style={{ "--accent": accent } as React.CSSProperties}>
    <aside className="rail">
      <div className="brand"><span className="brand-mark">CX</span><span>Shop</span></div>
      <nav aria-label="Primary navigation">
        <a className="nav-active" href="#overview"><LayoutDashboard size={18}/>Overview</a>
        <a href="#operations"><Boxes size={18}/>Operations</a>
        <a href="#activity"><Activity size={18}/>Activity</a>
        <a href="#access"><ShieldCheck size={18}/>Access</a>
        <a href="/">Storefront</a>
        <a href="/vendor">Vendor portal</a>
        <a href="/admin">Admin portal</a>
        <a href="/sa">Super Admin</a>
      </nav>
      <div className="rail-foot"><a href="#settings"><Settings size={18}/>Settings</a><a href="/logout"><LogOut size={18}/>Sign out</a></div>
    </aside>
    <main className="main"><header><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><span className="health"><i/>System ready</span></header>{children}</main>
    <details className="tweak"><summary>Display</summary><div><button type="button">Comfortable</button><button type="button">Compact</button></div></details>
  </div>;
}

export function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}
