import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPublicCompanyBranding, type TenantPublicPortal } from "../../modules/tenant-portal";
import { logout, restoreSession } from "../../shared/api/platform-api";
import { fallbackTenantPortal } from "./tenant-site.defaults";

type TenantSiteContextValue = {
  authenticated: boolean;
  loading: boolean;
  portal: TenantPublicPortal;
  signOut: () => Promise<void>;
};

const TenantSiteContext = createContext<TenantSiteContextValue | null>(null);

let cachedPortal: TenantPublicPortal | null = null;
let portalRequest: Promise<TenantPublicPortal> | null = null;

function loadTenantPortal() {
  if (cachedPortal) return Promise.resolve(cachedPortal);
  portalRequest ??= getPublicCompanyBranding()
    .then((branding) => {
      const publicPortal = { ...fallbackTenantPortal, ...branding, configured: true };
      cachedPortal = publicPortal;
      return publicPortal;
    })
    .finally(() => {
      portalRequest = null;
    });
  return portalRequest;
}

const pageDescriptions: Record<string, string> = {
  "About Tech Media":
    "Learn how Tech Media has supported Tiruppur with computers, networking, business IT, and dependable technology service since 2002.",
  "Business IT Solutions":
    "Explore networking, Wi-Fi, servers, storage, CCTV, biometric attendance, POS, VoIP, and business IT solutions from Tech Media in Tiruppur.",
  Features:
    "Explore networking, Wi-Fi, servers, storage, CCTV, biometric attendance, POS, VoIP, and business IT solutions from Tech Media in Tiruppur.",
  "Contact Tech Media":
    "Contact Tech Media at 436, Avinashi Road, Tiruppur for computers, laptops, service, networking, and business technology solutions.",
  "Tech Media Team": "Meet the local Tech Media product, service, and business IT support team in Tiruppur.",
  "Shipping and Delivery Policy": "Read Tech Media shipping, delivery, dispatch, tracking, store pickup, and package inspection information.",
  "Returns, Replacements and Refunds": "Read the Tech Media policy for eligible returns, replacements, warranty claims, inspections, and refunds.",
  "Privacy Policy": "Learn how Tech Media collects, uses, shares, protects, and retains storefront and customer information.",
  "Terms of Use": "Read the terms for using the Tech Media storefront, placing orders, payments, warranties, and acceptable use.",
  "Cookie Policy": "Learn how the Tech Media storefront uses essential, preference, analytics, and third-party cookies.",
  "Computer Service and Support in Tiruppur": "Contact Tech Media in Tiruppur for computer service, laptop support, warranty help, upgrades, and business IT assistance.",
  "Order Help": "Get help from Tech Media with order confirmation, shipping, tracking, delivery damage, returns, and warranty."
};

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(property ? "property" : "name", name);
    document.head.append(element);
  }
  element.content = content;
}

function updatePublicSeo(brandName: string, pageTitle?: string) {
  const title = pageTitle
    ? `${pageTitle} | ${brandName}`
    : `${brandName} | Computers and IT Solutions in Tiruppur`;
  const description =
    (pageTitle ? pageDescriptions[pageTitle] : undefined) ??
    "Tech Media provides computers, laptops, networking, IT infrastructure, business technology, and dependable service in Tiruppur.";
  const canonicalUrl = new URL(window.location.pathname, window.location.origin).toString();

  document.title = title;
  setMeta("description", description);
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:url", canonicalUrl, true);
  setMeta("og:type", "website", true);
  setMeta("og:site_name", brandName, true);
  setMeta("twitter:card", "summary");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  const scriptId = "tech-media-business-schema";
  let schema = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!schema) {
    schema = document.createElement("script");
    schema.id = scriptId;
    schema.type = "application/ld+json";
    document.head.append(schema);
  }
  schema.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Tiruppur",
      addressRegion: "Tamil Nadu",
      postalCode: "641602",
      streetAddress: "436, Avinashi Road"
    },
    name: brandName,
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IN",
      merchantReturnLink: new URL("/returns", window.location.origin).toString(),
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: ["https://schema.org/ReturnInStore", "https://schema.org/ReturnByMail"],
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
    },
    telephone: "+91 98946 44450",
    url: window.location.origin
  });
}

export function TenantSiteProvider({
  children,
  manageDocumentTitle = true,
  pageTitle
}: {
  children: ReactNode;
  manageDocumentTitle?: boolean;
  pageTitle?: string | undefined;
}) {
  const [portal, setPortal] = useState(cachedPortal ?? fallbackTenantPortal);
  const [loading, setLoading] = useState(cachedPortal === null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    void loadTenantPortal()
      .then((nextPortal) => {
        if (active) setPortal(nextPortal);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void restoreSession("tenant")
      .then((session) => {
        if (active) setAuthenticated(session.authenticated && session.userType === "tenant");
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!manageDocumentTitle) return;
    updatePublicSeo(portal.brandName, pageTitle);
  }, [manageDocumentTitle, pageTitle, portal.brandName]);

  const value = useMemo(
    () => ({
      authenticated,
      loading,
      portal,
      signOut: async () => {
        await logout("tenant");
        setAuthenticated(false);
      }
    }),
    [authenticated, loading, portal]
  );

  return <TenantSiteContext.Provider value={value}>{children}</TenantSiteContext.Provider>;
}

export function useTenantSite() {
  const context = useContext(TenantSiteContext);
  if (!context) throw new Error("useTenantSite must be used inside TenantSiteProvider.");
  return context;
}
