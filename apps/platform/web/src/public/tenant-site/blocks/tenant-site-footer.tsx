import {
  getStorefrontSiteNavigation,
  type StorefrontSiteNavigation
} from "@cxshop/ecommerce-web";
import { Link } from "@tanstack/react-router";
import {
  AtSignIcon,
  CameraIcon,
  ExternalLink,
  Globe2Icon,
  MessageCircleIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTenantSite } from "../tenant-site.context";
import { TenantSiteLogo } from "./tenant-site-logo";

export function TenantSiteFooter() {
  const { authenticated, portal } = useTenantSite();
  const [navigation, setNavigation] = useState<StorefrontSiteNavigation | null>(null);

  useEffect(() => {
    let active = true;
    getStorefrontSiteNavigation()
      .then((value) => {
        if (active) setNavigation(value);
      })
      .catch(() => {
        if (active) setNavigation(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const about =
    navigation?.about ||
    "Since 2002, Tech Media has helped Tiruppur homes and businesses choose, install, maintain, and upgrade dependable computers and IT solutions—with practical advice and local support after every purchase.";
  const copyright =
    navigation?.copyrightText ||
    `© 2002–${new Date().getFullYear()} ${portal.brandName}. All rights reserved.`;
  const poweredBy = navigation?.poweredByText || "Powered by Logicx";

  return (
    <footer className="tenant-portal-footer">
      <div className="tenant-portal-footer-brand">
        <div>
          <TenantSiteLogo className="tenant-portal-mark" />
          <strong>{portal.brandName}</strong>
        </div>
        <p>{about}</p>
        <div className="tenant-portal-footer-socials" aria-label="Tech Media social and contact links">
          {navigation?.socialLinks.map((link) => (
            <a
              aria-label={`Follow ${portal.brandName} on ${link.label}`}
              href={link.href}
              key={link.label}
              rel="noreferrer"
              target="_blank"
              title={link.label}
            >
              <SocialIcon label={link.label} />
            </a>
          ))}
          <a
            aria-label={`Contact ${portal.brandName} on WhatsApp`}
            href="https://wa.me/919894644450"
            rel="noreferrer"
            target="_blank"
            title="WhatsApp"
          >
            <MessageCircleIcon />
          </a>
        </div>
        {portal.domain ? <small>{portal.domain}</small> : null}
      </div>
      <div className="tenant-portal-footer-links">
        <section>
          <strong>Shop</strong>
          <Link to="/shop">All products</Link>
          <a href="/#promotions">Promotions</a>
          <a href="/#brands">Brands</a>
          <Link to="/blog">Buying guides</Link>
          <a href={authenticated ? "/admin/" : portal.loginPath}>
            {authenticated ? "Dashboard" : "Log in"}
          </a>
        </section>
        <section>
          <strong>Company</strong>
          <Link to="/about">About</Link>
          <Link to="/team">Team</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
          {portal.publicSiteUrl ? (
            <a href={portal.publicSiteUrl}>
              Public site <ExternalLink />
            </a>
          ) : null}
        </section>
        <section>
          <strong>Help and legal</strong>
          <Link to="/support">Support</Link>
          <Link to="/order-help">Order help</Link>
          <Link to="/shipping">Shipping and delivery</Link>
          <Link to="/returns">Returns and refunds</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of use</Link>
          <Link to="/cookies">Cookie policy</Link>
        </section>
      </div>
      <div className="tenant-portal-footer-bottom">
        <span>{copyright}</span>
        <a href="https://logicx.in" rel="noreferrer" target="_blank">
          {poweredBy} <ExternalLink />
        </a>
      </div>
    </footer>
  );
}

function SocialIcon({ label }: { label: string }) {
  if (label.toLowerCase() === "instagram") return <CameraIcon />;
  if (label.toLowerCase() === "linkedin") return <Globe2Icon />;
  return <AtSignIcon />;
}
