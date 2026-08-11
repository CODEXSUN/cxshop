export type StorefrontProduct = {
  brand: string | null;
  category: string;
  compareAtPrice: number | null;
  description: string;
  featured: boolean;
  imageAlt: string;
  imageUrl: string;
  name: string;
  price: number;
  shortDescription: string;
  slug: string;
  subtitle: string;
  variantCount: number;
};

export type StorefrontProductDetail = StorefrontProduct & {
  bulletPoints: string[];
  returnPolicy: string;
  variants: Array<{ id: number; sku: string; title: string; price: number }>;
  warranty: string;
};

export type StorefrontCatalogFilters = {
  brand?: string | undefined;
  category?: string | undefined;
  maxPrice?: number | undefined;
  minPrice?: number | undefined;
  scope?: StorefrontSearchScope | undefined;
  search?: string | undefined;
  sort?: StorefrontSort | undefined;
};

export type StorefrontSearchScope = "all" | "products" | "brands" | "categories";
export type StorefrontSort = "featured" | "name" | "price-asc" | "price-desc" | "discount";

export type StorefrontDiscovery = {
  brands: Array<{ logoAlt: string; logoUrl: string; name: string; productCount: number }>;
  categories: Array<{ name: string; productCount: number }>;
  priceRange: { maximum: number; minimum: number };
};
export type StorefrontSiteNavigation = {
  about: string;
  copyrightOwner: string;
  groups: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  socialLinks: Array<{ label: string; href: string }>;
};
