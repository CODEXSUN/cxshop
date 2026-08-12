import type { ReactNode } from "react";
import {
  BookOpenIcon,
  LifeBuoyIcon,
  LogOutIcon,
  MailIcon,
  Settings2Icon,
  StoreIcon
} from "lucide-react";

import { AppLayout } from "./app-layout";
import type { SidebarBrand, SidebarUser } from "../blocks/menu/sidemenu/app-sidebar";
import type { TopMenuWorkspaceItem } from "../blocks/menu/sidemenu/top-menu";
import type { SidemenuItem } from "../blocks/menu/sidemenu/sub/sidemenu-section";

type ApplicationLayoutProps = {
  actions?: ReactNode;
  brand?: SidebarBrand;
  children: ReactNode;
  menuItems?: SidemenuItem[];
  headerTitle?: ReactNode;
  homeHref?: string;
  onLogout?: () => void | Promise<void>;
  subtitle?: ReactNode;
  title?: ReactNode;
  user?: SidebarUser;
  versionLabel?: string;
  workspaceItems?: TopMenuWorkspaceItem[];
};

const applicationMenuItems: SidemenuItem[] = [
  {
    title: "Application",
    url: "/admin/application/overview",
    icon: StoreIcon,
    isActive: true,
    items: [
      {
        title: "Landing Desk",
        url: "/admin/application/overview"
      },
      {
        title: "Company",
        url: "/admin/core/organisation/company"
      },
      {
        title: "Settings",
        url: "/admin/application/settings"
      }
    ]
  },
  {
    title: "Settings",
    url: "/admin/application/settings",
    icon: Settings2Icon
  }
];

const applicationWorkspaceItems = [
  {
    title: "Application",
    description: "Company setup, users, roles, settings, and landing desk.",
    icon: StoreIcon,
    active: true,
    url: "/admin/application/overview"
  },
  {
    title: "Mail",
    description: "Reusable workspace mail services.",
    icon: MailIcon,
    url: "/admin/application/overview"
  },
  {
    title: "Knowledge",
    description: "Application documents, guides, and shared notes.",
    icon: BookOpenIcon,
    url: "/admin/application/overview"
  }
];

export function ApplicationLayout({
  actions,
  brand,
  children,
  headerTitle = "Overview",
  homeHref = "/",
  menuItems = applicationMenuItems,
  onLogout,
  subtitle = "Standalone back-office workspace.",
  title = "Back Office",
  user,
  versionLabel,
  workspaceItems = applicationWorkspaceItems
}: ApplicationLayoutProps) {
  return (
    <AppLayout
      brand={{
        ...brand,
        href: brand?.href ?? "/admin/application/overview",
        subtitle: brand?.subtitle ?? "back-office workspace",
        title: brand?.title ?? "Back Office"
      }}
      headerTitle={headerTitle}
      homeHref={homeHref}
      logoutHref="/admin/login"
      menuItems={menuItems}
      {...(onLogout ? { onLogout } : {})}
      subtitle={subtitle}
      title={title}
      {...(user ? { user } : {})}
      {...(versionLabel ? { versionLabel } : {})}
      userMenuItems={[
        {
          icon: LifeBuoyIcon,
          title: "Support",
          url: "/status"
        },
        {
          icon: Settings2Icon,
          title: "Account",
          url: "/admin/application/settings"
        },
        {
          icon: LogOutIcon,
          title: "Log out",
          url: "/admin/login"
        }
      ]}
      workspaceItems={workspaceItems}
    >
      {actions ? <div className="px-4 pt-4 lg:px-6">{actions}</div> : null}
      <div>{children}</div>
    </AppLayout>
  );
}
