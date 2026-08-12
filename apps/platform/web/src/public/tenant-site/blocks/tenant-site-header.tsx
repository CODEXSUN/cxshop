import { Link } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@cxshop/ui";
import { ArrowRight, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useTenantSite } from "../tenant-site.context";
import type { TenantPublicPageKey } from "../tenant-site.types";
import { TenantSiteLogo } from "./tenant-site-logo";

export function TenantSiteHeader({ activePage }: { activePage: TenantPublicPageKey }) {
  const { authenticated, portal, signOut } = useTenantSite();

  return (
    <nav className="tenant-portal-nav" aria-label="Public site navigation">
      <Link className="tenant-portal-brand" to="/" aria-label={`${portal.brandName} home`}>
        <TenantSiteLogo className="tenant-portal-mark" />
        <span>
          <strong>{portal.brandName}</strong>
          <small>Computers &amp; Business</small>
        </span>
      </Link>
      <PublicNavigation activePage={activePage} />
      <div className="tenant-portal-session-actions">
        {authenticated ? (
          <>
            <a className="tenant-portal-login" href="/admin/">
              Dashboard <ArrowRight />
            </a>
            <button className="tenant-portal-logout" type="button" onClick={() => void signOut()}>
              Log out <LogOut />
            </button>
          </>
        ) : (
          <a className="tenant-portal-login" href={portal.loginPath}>
            Portal <ArrowRight />
          </a>
        )}
      </div>
    </nav>
  );
}

function PublicNavigation({ activePage }: { activePage: TenantPublicPageKey }) {
  return (
    <NavigationMenu className="tenant-portal-menu">
      <NavigationMenuList>
        <PublicMenu label="Shop">
          <MenuFeature href="/shop" eyebrow="CXShop collection" title="Computers for real work">
            Shop laptops, desktops, accessories, and selected business systems.
          </MenuFeature>
          <MenuColumn title="Shop">
            <MenuLink href="/shop">All products</MenuLink>
            <MenuLink href="/#promotions">Promotions</MenuLink>
            <MenuLink href="/#brands">Brands</MenuLink>
          </MenuColumn>
          <MenuColumn title="Guides">
            <MenuLink href="/blog/choose-business-computer-system">Business computers</MenuLink>
            <MenuLink href="/blog/business-laptop-buying-guide">Laptop buying guide</MenuLink>
            <MenuLink href="/blog/desktop-vs-workstation-guide">Desktop or workstation</MenuLink>
          </MenuColumn>
        </PublicMenu>
        <PublicMenu label="Solutions">
          <MenuFeature href="/blog" eyebrow="Practical guidance" title="Choose and maintain better">
            Clear advice for performance, security, upgrades, and computer lifecycle planning.
          </MenuFeature>
          <MenuColumn title="Plan">
            <MenuLink href="/features">Store services</MenuLink>
            <MenuLink href="/security">Security</MenuLink>
            <MenuLink href="/shipping">Delivery</MenuLink>
          </MenuColumn>
          <MenuColumn title="Operate">
            <MenuLink href="/blog/computer-upgrade-priority-guide">Upgrades</MenuLink>
            <MenuLink href="/blog/small-business-network-security-checklist">
              Network security
            </MenuLink>
            <MenuLink href="/blog/preventive-computer-maintenance-guide">Maintenance</MenuLink>
          </MenuColumn>
        </PublicMenu>
        <PublicMenu label="Company">
          <MenuFeature href="/about" eyebrow="About CXShop" title="Useful technology support">
            Learn about the team, service approach, contact routes, and product updates.
          </MenuFeature>
          <MenuColumn title="Company">
            <MenuLink href="/about">About</MenuLink>
            <MenuLink href="/team">Team</MenuLink>
            <MenuLink href="/contact">Contact</MenuLink>
          </MenuColumn>
          <MenuColumn title="Information">
            <MenuLink href="/updates">Updates</MenuLink>
            <MenuLink href="/status">Platform status</MenuLink>
            <MenuLink href="/returns">Returns</MenuLink>
          </MenuColumn>
        </PublicMenu>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              className="tenant-portal-direct-link"
              to="/blog"
              aria-current={activePage === "blog" ? "page" : undefined}
            >
              Blog
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function PublicMenu({ children, label }: { children: ReactNode; label: string }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent className="tenant-portal-nav-content">
        <div className="tenant-portal-nav-panel">{children}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MenuFeature({
  children,
  eyebrow,
  href,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  href: string;
  title: string;
}) {
  return (
    <NavigationMenuLink asChild>
      <a className="tenant-portal-nav-feature" href={href}>
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{children}</span>
        <b>
          Explore <ArrowRight />
        </b>
      </a>
    </NavigationMenuLink>
  );
}

function MenuColumn({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="tenant-portal-nav-column">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function MenuLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <NavigationMenuLink asChild>
      <a href={href}>{children}</a>
    </NavigationMenuLink>
  );
}
