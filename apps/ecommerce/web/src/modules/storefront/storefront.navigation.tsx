import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@cxshop/ui";
import { ArrowRightIcon, UserRoundIcon } from "lucide-react";
import type { ReactNode } from "react";
import { StorefrontSearch } from "./storefront.search";
import type {
  StorefrontBranding,
  StorefrontDiscovery,
  StorefrontFilters
} from "./storefront.types";
import type { StorefrontAnnouncement } from "./storefront.types";
import { StorefrontAnnouncementBanner } from "./storefront.announcement";

export function StoreHeader({
  announcement,
  branding,
  discovery,
  filters
}: {
  announcement: StorefrontAnnouncement | null;
  branding: StorefrontBranding | null;
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
}) {
  return (
    <>
      <StorefrontAnnouncementBanner announcement={announcement} />
      <header className="cx-store__header">
        <a className="cx-store__brand" href="/">
          <img
            alt=""
            aria-hidden="true"
            className="cx-store__brand-mark"
            src={branding?.logoUrl ?? "/icons/logo.svg"}
          />
          <strong>{branding?.brandName ?? "CXShop"}</strong>
        </a>
        <StoreNavigation branding={branding} discovery={discovery} />
        <StorefrontSearch branding={branding} discovery={discovery} filters={filters} />
        <a className="cx-store__account" href="/login">
          <UserRoundIcon size={17} /> Portal
        </a>
      </header>
    </>
  );
}

function StoreNavigation({
  branding,
  discovery
}: {
  branding: StorefrontBranding | null;
  discovery: StorefrontDiscovery;
}) {
  const brandName = branding?.brandName ?? "CXShop";
  return (
    <NavigationMenu className="cx-store__primary-nav" aria-label="Store navigation">
      <NavigationMenuList>
        <StoreMenu label="Shop">
          <MenuFeature
            description="Compare dependable computers and accessories for work, study, and creativity."
            eyebrow="Computer store"
            href="/shop"
            title="Find the right system"
          />
          <MenuColumn title="Categories">
            {discovery.categories.slice(0, 5).map((item) => (
              <MenuLink href={`/shop/category/${encodeURIComponent(item.name)}`} key={item.name}>
                {item.name}
                <small>{item.productCount}</small>
              </MenuLink>
            ))}
          </MenuColumn>
          <MenuColumn title="Discover">
            <MenuLink href="/#promotions">Current promotions</MenuLink>
            <MenuLink href="/#brands">Shop by brand</MenuLink>
            <MenuLink href="/search?sort=featured">Featured systems</MenuLink>
          </MenuColumn>
        </StoreMenu>
        <StoreMenu label="Solutions">
          <MenuFeature
            description="Use clear buying, security, upgrade, and maintenance guidance before you invest."
            eyebrow="Practical guidance"
            href="/blog"
            title="Choose with confidence"
          />
          <MenuColumn title="For your work">
            <MenuLink href="/blog/choose-business-computer-system">Business systems</MenuLink>
            <MenuLink href="/blog/business-laptop-buying-guide">Mobile and remote work</MenuLink>
            <MenuLink href="/blog/desktop-vs-workstation-guide">Focused workspaces</MenuLink>
          </MenuColumn>
          <MenuColumn title="Keep it working">
            <MenuLink href="/blog/computer-upgrade-priority-guide">Performance upgrades</MenuLink>
            <MenuLink href="/blog/small-business-network-security-checklist">
              Network security
            </MenuLink>
            <MenuLink href="/blog/preventive-computer-maintenance-guide">Maintenance</MenuLink>
          </MenuColumn>
        </StoreMenu>
        <StoreMenu label="Company">
          <MenuFeature
            description={`Meet the team and learn how ${brandName} helps customers make durable technology decisions.`}
            eyebrow={`About ${brandName}`}
            href="/about"
            title="Technology with useful support"
          />
          <MenuColumn title="Company">
            <MenuLink href="/about">About</MenuLink>
            <MenuLink href="/team">Team</MenuLink>
            <MenuLink href="/contact">Contact</MenuLink>
          </MenuColumn>
          <MenuColumn title="Help and policy">
            <MenuLink href="/shipping">Shipping</MenuLink>
            <MenuLink href="/returns">Returns</MenuLink>
            <MenuLink href="/privacy">Privacy and terms</MenuLink>
          </MenuColumn>
        </StoreMenu>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/blog">
              Blog
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function StoreMenu({ children, label }: { children: ReactNode; label: string }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent className="cx-store__nav-content">
        <div className="cx-store__nav-panel">{children}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MenuFeature({
  description,
  eyebrow,
  href,
  title
}: {
  description: string;
  eyebrow: string;
  href: string;
  title: string;
}) {
  return (
    <NavigationMenuLink asChild>
      <a className="cx-store__nav-feature" href={href}>
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{description}</span>
        <b>
          Explore <ArrowRightIcon />
        </b>
      </a>
    </NavigationMenuLink>
  );
}

function MenuColumn({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="cx-store__nav-column">
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
