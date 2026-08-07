"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDown, CircuitBoard, Cpu, Grid2X2, Headphones, Laptop, MemoryStick, Monitor, Network, X } from "lucide-react";

type MenuItem = { label: string; slug: string };
type MenuSection = { label: string; slug: string; icon: ComponentType<{ size?: number }>; items: MenuItem[]; headline: string; copy: string };

const sections: MenuSection[] = [
  { label: "Computers", slug: "desktops", icon: Cpu, items: [{ label: "Desktop systems", slug: "desktops" }, { label: "Business computers", slug: "desktops" }, { label: "Custom PC components", slug: "components" }], headline: "Computers built for real work", copy: "Explore ready systems and the parts required to build your own." },
  { label: "Laptops", slug: "laptops", icon: Laptop, items: [{ label: "Everyday laptops", slug: "laptops" }, { label: "Business notebooks", slug: "laptops" }, { label: "Laptop spares", slug: "spares" }], headline: "Portable performance", copy: "Compare notebooks, chargers, batteries, and upgrade-ready models." },
  { label: "Monitors", slug: "monitors", icon: Monitor, items: [{ label: "Office monitors", slug: "monitors" }, { label: "Gaming displays", slug: "monitors" }, { label: "Display accessories", slug: "accessories" }], headline: "A clearer workspace", copy: "Find practical displays for productivity, design, and gaming." },
  { label: "Components", slug: "components", icon: CircuitBoard, items: [{ label: "Processors and boards", slug: "components" }, { label: "Memory and storage", slug: "storage" }, { label: "Power and cooling", slug: "components" }], headline: "Build, repair, upgrade", copy: "Core hardware selected for dependable desktop upgrades." },
  { label: "Storage", slug: "storage", icon: MemoryStick, items: [{ label: "NVMe solid-state drives", slug: "storage" }, { label: "External storage", slug: "storage" }, { label: "Memory upgrades", slug: "components" }], headline: "Fast, dependable storage", copy: "Upgrade capacity and reduce application load times." },
  { label: "Networking", slug: "networking", icon: Network, items: [{ label: "Wi-Fi routers", slug: "networking" }, { label: "Network adapters", slug: "networking" }, { label: "Cables and accessories", slug: "accessories" }], headline: "Keep every device connected", copy: "Networking essentials for homes, shops, and offices." },
  { label: "Accessories", slug: "accessories", icon: Headphones, items: [{ label: "Keyboards and mice", slug: "accessories" }, { label: "Audio and webcams", slug: "accessories" }, { label: "Cables and adapters", slug: "accessories" }], headline: "Complete your setup", copy: "Useful peripherals without unnecessary clutter." }
];

export function StoreMegaMenu() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const section = sections[active]!;

  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); shell.current?.querySelector<HTMLElement>("[aria-selected=true]")?.focus(); } }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  return <div className={`store-menu-shell${open ? " is-open" : ""}`} ref={shell} onMouseLeave={() => setOpen(false)}>
    <div className="store-category-nav" role="tablist" aria-label="Shop departments">
      {sections.map((item, index) => <button aria-controls="store-mega-panel" aria-expanded={open} aria-label={item.label} aria-selected={active === index} key={item.label} onClick={() => { setActive(index); setOpen(current => active === index ? !current : true); }} onFocus={() => setActive(index)} onMouseEnter={() => { setActive(index); setOpen(true); }} role="tab" type="button"><item.icon size={19}/><span>{item.label}</span><ChevronDown className="menu-chevron" size={15}/></button>)}
      <a href="/#categories"><Grid2X2 size={18}/>View all</a>
    </div>
    <button aria-label="Close menu" className="store-menu-close" onClick={() => setOpen(false)} type="button"><X size={19}/></button>
    <section aria-live="polite" className="store-mega-panel" id="store-mega-panel" role="tabpanel">
      <div className="store-menu-links"><span>Shop {section.label}</span>{section.items.map(item => <a href={`/categories/${item.slug}`} key={`${section.label}-${item.label}`}>{item.label}<span aria-hidden="true">→</span></a>)}</div>
      <section className="store-menu-feature"><div><span>Featured department</span><h2>{section.headline}</h2><p>{section.copy}</p><a href={`/categories/${section.slug}`}>Explore {section.label}</a></div><section.icon aria-hidden="true" size={210}/></section>
    </section>
  </div>;
}
