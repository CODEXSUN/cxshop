import type { TenantPublicPortal } from "../../modules/tenant-portal";

export const fallbackTenantPortal: TenantPublicPortal = {
  brandName: "Tech Media",
  configured: false,
  domain: "",
  eyebrow: "Your trusted technology partner in Tiruppur",
  features: [
    {
      description: "Computers, laptops, workstations, printers, accessories, and upgrades.",
      label: "01",
      title: "Computers and laptops"
    },
    {
      description: "Networking, Wi-Fi, servers, storage, CCTV, attendance, POS, and communications.",
      label: "02",
      title: "Business IT solutions"
    },
    {
      description: "Installation, troubleshooting, maintenance, warranty assistance, and upgrades.",
      label: "03",
      title: "Service and support"
    }
  ],
  footerText:
    "Computers, IT infrastructure, networking, business technology, and dependable local support.",
  headline: "Technology that works for you.",
  loginPath: "/admin/login",
  logoDarkUrl: null,
  logoUrl: null,
  posts: [
    {
      description: "Choose a dependable computer around the workload, useful life, and upgrade path.",
      href: "/blog/choose-business-computer-system",
      label: "Buying guide",
      title: "How to choose a business computer"
    },
    {
      description: "Compare performance, battery, display, ports, service, and ownership cost.",
      href: "/blog/business-laptop-buying-guide",
      label: "Laptop guide",
      title: "Choose a laptop that fits the work"
    },
    {
      description:
        "Reduce failures and extend useful life with a practical maintenance routine.",
      href: "/blog/preventive-computer-maintenance-guide",
      label: "Service guide",
      title: "Preventive computer maintenance"
    }
  ],
  publicSiteUrl: null,
  slides: [
    {
      description: "Laptops, desktops, workstations, printers, accessories, and technology upgrades.",
      label: "Retail",
      title: "Choose technology with practical guidance"
    },
    {
      description: "Connected networking, infrastructure, security, attendance, POS, and communication solutions.",
      label: "Business IT",
      title: "Build a reliable technology environment"
    },
    {
      description: "Dependable installation, maintenance, troubleshooting, and planned upgrades.",
      label: "Support",
      title: "Keep essential technology working"
    }
  ],
  summary:
    "25+ years helping Tiruppur customers choose, implement, maintain, and upgrade practical technology.",
  tenantCode: null,
  theme: "blue"
};
