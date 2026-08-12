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
  variants: Array<{ id: number; price: number; sku: string; title: string }>;
  warranty: string;
};
export type StorefrontCategory = { name: string; productCount: number };
export type StorefrontSearchScope = "all" | "products" | "brands" | "categories";
export type StorefrontSort = "featured" | "name" | "price-asc" | "price-desc" | "discount";
export type StorefrontFilters = {
  brand: string;
  category: string;
  maxPrice: number | null;
  minPrice: number | null;
  scope: StorefrontSearchScope;
  search: string;
  sort: StorefrontSort;
};
export type StorefrontDiscovery = {
  brands: Array<{ logoAlt: string; logoUrl: string; name: string; productCount: number }>;
  categories: StorefrontCategory[];
  priceRange: { maximum: number; minimum: number };
};
export type StorefrontBlogPost = {
  excerpt: string;
  featuredImage: string;
  imageAlt: string;
  publishedAt: string | null;
  slug: string;
  title: string;
};
export type StorefrontSiteNavigation = {
  about: string;
  copyrightOwner: string;
  groups: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  socialLinks: Array<{ label: string; href: string }>;
};
export type StorefrontAnnouncement = {
  displayDurationMs: number;
  endsAt: string | null;
  eventKey: string;
  message: string;
  startsAt: string;
};
export type StorefrontBranding = {
  brandName: string;
  logoDarkUrl: string | null;
  logoUrl: string | null;
};
