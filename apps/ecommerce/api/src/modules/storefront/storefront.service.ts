import type { StorefrontCatalogFilters } from "./storefront.types.js";
import type { StorefrontCatalogSource } from "../catalog-data-source/catalog-data-source.types.js";
import { StorefrontProfileService } from "../storefront-profile/storefront-profile.service.js";

export class StorefrontService {
  constructor(private readonly source: StorefrontCatalogSource) {}
  catalog(filters: StorefrontCatalogFilters) {
    return this.source.catalog({
      ...filters,
      brand: filters.brand?.trim(),
      category: filters.category?.trim(),
      search: filters.search?.trim()
    });
  }
  categories() {
    return this.source.categories();
  }
  discovery() {
    return this.source.discovery();
  }
  product(slug: string) {
    return this.source.product(slug.trim().toLowerCase());
  }
  async siteNavigation() {
    const profile = await new StorefrontProfileService().get();
    return {
      about: profile.aboutUs,
      copyrightText: profile.copyrightText,
      groups: [
        {
          title: "Shop",
          links: [
            { label: "All products", href: "/shop" },
            { label: "Promotions", href: "/#promotions" },
            { label: "Solutions", href: "/#solutions" },
            { label: "Brands", href: "/#brands" },
            { label: "Customer portal", href: "/login" }
          ]
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Team", href: "/team" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
            { label: "Platform status", href: "/status" }
          ]
        },
        {
          title: "Help",
          links: [
            { label: "Shipping", href: "/shipping" },
            { label: "Returns & refunds", href: "/returns" },
            { label: "Support", href: "/contact" },
            { label: "Order help", href: "/login" }
          ]
        },
        {
          title: "Legal",
          links: [
            { label: "Privacy policy", href: "/privacy" },
            { label: "Terms of use", href: "/terms" },
            { label: "Cookie policy", href: "/cookies" }
          ]
        }
      ],
      poweredByText: profile.poweredByText,
      socialLinks: [
        { label: "LinkedIn", href: profile.linkedinUrl },
        { label: "Instagram", href: profile.instagramUrl },
        { label: "X", href: profile.xUrl }
      ].filter((link) => link.href),
      tagline: profile.tagline
    };
  }
}
