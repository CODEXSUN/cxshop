import { StorefrontRepository } from "./storefront.repository.js";
import type { StorefrontCatalogFilters } from "./storefront.types.js";

export class StorefrontService {
  constructor(private readonly repository = new StorefrontRepository()) {}
  catalog(filters: StorefrontCatalogFilters) {
    return this.repository.list({
      ...filters,
      brand: filters.brand?.trim(),
      category: filters.category?.trim(),
      search: filters.search?.trim()
    });
  }
  categories() {
    return this.repository.categories();
  }
  discovery() {
    return this.repository.discovery();
  }
  product(slug: string) {
    return this.repository.find(slug.trim().toLowerCase());
  }
  siteNavigation() {
    return {
      about:
        "Reliable technology, practical buying guidance, and business-ready support for work, study, and creativity.",
      copyrightOwner: "CXShop",
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
      socialLinks: [
        { label: "LinkedIn", href: "https://www.linkedin.com" },
        { label: "Instagram", href: "https://www.instagram.com" },
        { label: "X", href: "https://x.com" }
      ]
    };
  }
}
