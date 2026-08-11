import { useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  HeadphonesIcon,
  AtSignIcon,
  CameraIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
  Globe2Icon,
  UserRoundIcon
} from "lucide-react";
import type {
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontBlogPost,
  StorefrontSiteNavigation
} from "./storefront.types";
import { money, whatsappLink } from "./storefront.formatters";
import { StorefrontSearch } from "./storefront.search";

type FilterProps = {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
};

export function StoreHeader({ discovery, filters }: Pick<FilterProps, "discovery" | "filters">) {
  return (
    <>
      <div className="cx-store__notice">
        Free delivery on selected systems · Business purchase support available
      </div>
      <header className="cx-store__header">
        <a className="cx-store__brand" href="/">
          <ShoppingBagIcon />
          <strong>CXShop</strong>
        </a>
        <nav>
          <details className="cx-store__menu">
            <summary>Catalog</summary>
            <MenuPanel discovery={discovery} />
          </details>
          <a href="/#promotions">Promotions</a>
          <a href="/#solutions">Solutions</a>
          <a href="/#brands">Brands</a>
          <a href="/blog">Blog</a>
        </nav>
        <StorefrontSearch discovery={discovery} filters={filters} />
        <a className="cx-store__account" href="/login">
          <UserRoundIcon size={17} /> Portal
        </a>
      </header>
    </>
  );
}

function MenuPanel({ discovery }: { discovery: StorefrontDiscovery }) {
  return (
    <div className="cx-store__menu-panel">
      <div>
        <strong>Categories</strong>
        {discovery.categories.map((item) => (
          <a href={`/shop/category/${encodeURIComponent(item.name)}`} key={item.name}>
            {item.name}
            <span>{item.productCount}</span>
          </a>
        ))}
      </div>
      <div>
        <strong>Brands</strong>
        {discovery.brands.map((item) => (
          <a href={`/search?q=${encodeURIComponent(item.name)}&scope=brands`} key={item.name}>
            {item.name}
            <span>{item.productCount}</span>
          </a>
        ))}
      </div>
      <div>
        <strong>Customer</strong>
        <a href="/login">Customer portal</a>
        <a href="/login">Orders and invoices</a>
        <a href="/contact">Service and support</a>
      </div>
    </div>
  );
}

export function HeroSlider({ products }: { products: StorefrontProduct[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (products.length < 2) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % products.length),
      6800
    );
    return () => window.clearInterval(timer);
  }, [products.length]);
  const product = products[active];
  if (!product) return null;
  return (
    <section
      aria-label="Featured products"
      aria-roledescription="carousel"
      className="cx-store__hero"
    >
      <div className="cx-store__hero-copy" key={`copy-${product.slug}`}>
        <span className="cx-store__hero-reveal">{product.brand} · Featured system</span>
        <h1 className="cx-store__hero-reveal">{product.name}</h1>
        <p className="cx-store__hero-reveal">{product.description}</p>
        <a className="cx-store__hero-reveal" href={`/shop/product/${product.slug}`}>
          Explore this product
        </a>
      </div>
      <div className="cx-store__hero-media" key={`media-${product.slug}`}>
        <img src={product.imageUrl} alt={product.imageAlt || product.name} />
        <div aria-label="Choose featured product" className="cx-store__hero-bullets">
          {products.map((item, index) => (
            <button
              aria-label={`Show ${item.name}`}
              aria-current={index === active ? "true" : undefined}
              className={index === active ? "is-active" : undefined}
              key={item.slug}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromotionsSection({ products }: { products: StorefrontProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="cx-store__promotions" id="promotions">
      <SectionTitle label="Current promotions" title="Better value on everyday technology" />
      <div className="cx-store__promotion-grid">
        {products.map((product) => (
          <a
            className="cx-store__promotion-card"
            href={`/shop/product/${product.slug}`}
            key={product.slug}
          >
            <span className="cx-store__promotion-media">
              <img alt={product.imageAlt || product.name} loading="lazy" src={product.imageUrl} />
              <span className="cx-store__promotion-saving">
                Save {money((product.compareAtPrice ?? product.price) - product.price)}
              </span>
            </span>
            <span className="cx-store__promotion-copy">
              <small>{[product.brand, product.category].filter(Boolean).join(" · ")}</small>
              <strong>{product.name}</strong>
              <span className="cx-store__promotion-price">
                <b>{money(product.price)}</b>
                <del>{money(product.compareAtPrice ?? product.price)}</del>
              </span>
              <span className="cx-store__promotion-link">View offer</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function BrandsSection({ brands }: { brands: StorefrontDiscovery["brands"] }) {
  const items = [...brands, ...brands];
  return (
    <section className="cx-store__brands" id="brands">
      <span>Shop trusted brands</span>
      <div className="cx-store__brand-marquee">
        <div className="cx-store__brand-track">
          {items.map((brand, index) => (
            <a
              aria-hidden={index >= brands.length ? "true" : undefined}
              href={`/search?q=${encodeURIComponent(brand.name)}&scope=brands`}
              key={`${brand.name}-${index}`}
              tabIndex={index >= brands.length ? -1 : undefined}
            >
              <span className="cx-store__brand-logo">
                {brand.logoUrl ? (
                  <img
                    alt={index >= brands.length ? "" : brand.logoAlt || `${brand.name} logo`}
                    src={brand.logoUrl}
                  />
                ) : (
                  <strong>{brand.name}</strong>
                )}
              </span>
              <small>{brand.productCount} products</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogSolutionsSection({ posts }: { posts: StorefrontBlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="cx-store__blog-solutions" id="solutions">
      <div className="cx-store__latest-heading">
        <div>
          <h2>Latest Posts</h2>
          <p>Practical computer guides from the CXShop editorial team</p>
        </div>
        <a href="/blog">View all posts</a>
      </div>
      <div className="cx-store__blog-solution-grid">
        {posts.map((post) => (
          <a href={`/blog/${post.slug}`} key={post.slug}>
            <span className="cx-store__blog-solution-media">
              {post.featuredImage ? (
                <img src={post.featuredImage} alt={post.imageAlt} loading="lazy" />
              ) : (
                <span>CXShop Journal</span>
              )}
              <span className="cx-store__blog-solution-arrow" aria-hidden="true">
                <ArrowUpRightIcon />
              </span>
            </span>
            <span className="cx-store__blog-solution-copy">
              <span className="cx-store__blog-meta">
                <b>{articleCategory(post.title)}</b>
                <span>Â·</span>
                <span>{readingMinutes(post.excerpt)} min read</span>
              </span>
              <strong>{post.title}</strong>
              <span>{post.excerpt}</span>
              <span className="cx-store__blog-author">
                <span>CX</span>
                <span>
                  <b>CXShop Editorial</b>
                  <small>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "Latest"}
                  </small>
                </span>
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
function readingMinutes(excerpt: string) {
  return Math.max(4, Math.round(excerpt.length / 35));
}
function articleCategory(title: string) {
  if (/laptop/iu.test(title)) return "Laptops";
  if (/desktop|workstation/iu.test(title)) return "Desktop";
  if (/network|security/iu.test(title)) return "Security";
  if (/upgrade|RAM|SSD/iu.test(title)) return "Upgrades";
  if (/maintenance/iu.test(title)) return "Maintenance";
  return "Buying Guide";
}

export function CatalogFilters({ discovery, filters, onFilters }: FilterProps) {
  return (
    <aside className="cx-store__filters" aria-label="Product filters">
      <strong>Filter the range</strong>
      <label>
        Category
        <select
          value={filters.category}
          onChange={(event) => onFilters({ ...filters, category: event.target.value })}
        >
          <option value="">All categories</option>
          {discovery.categories.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <label>
        Brand
        <select
          value={filters.brand}
          onChange={(event) => onFilters({ ...filters, brand: event.target.value })}
        >
          <option value="">All brands</option>
          {discovery.brands.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <div className="cx-store__price-filter">
        <span>Price range</span>
        <label>
          From
          <input
            min={0}
            type="number"
            value={filters.minPrice ?? ""}
            onChange={(event) =>
              onFilters({ ...filters, minPrice: numberOrNull(event.target.value) })
            }
            placeholder={String(discovery.priceRange.minimum)}
          />
        </label>
        <label>
          To
          <input
            min={0}
            type="number"
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              onFilters({ ...filters, maxPrice: numberOrNull(event.target.value) })
            }
            placeholder={String(discovery.priceRange.maximum)}
          />
        </label>
      </div>
      <label>
        Sort by
        <select
          value={filters.sort}
          onChange={(event) =>
            onFilters({ ...filters, sort: event.target.value as StorefrontFilters["sort"] })
          }
        >
          <option value="featured">Featured</option>
          <option value="name">Product name</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="discount">Largest saving</option>
        </select>
      </label>
      <button
        onClick={() =>
          onFilters({
            brand: "",
            category: "",
            maxPrice: null,
            minPrice: null,
            scope: "all",
            search: "",
            sort: "featured"
          })
        }
      >
        Reset all filters
      </button>
    </aside>
  );
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="cx-product-card">
      <a href={`/shop/product/${product.slug}`}>
        <div className="cx-product-card__image">
          {product.featured ? <span>Featured</span> : null}
          <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
        </div>
        <div className="cx-product-card__copy">
          <small>
            {product.brand} · {product.category}
          </small>
          <h3>{product.name}</h3>
          <p>{product.shortDescription}</p>
          <div>
            <strong>{money(product.price)}</strong>
            {product.compareAtPrice ? <del>{money(product.compareAtPrice)}</del> : null}
          </div>
        </div>
      </a>
      <a
        className="cx-product-card__enquiry"
        href={whatsappLink(`Hello CXShop, please share details for ${product.name}.`)}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircleIcon size={16} /> Enquire
      </a>
    </article>
  );
}

export function StoreFooter({ navigation }: { navigation: StorefrontSiteNavigation | null }) {
  const groups = navigation?.groups ?? defaultFooterGroups;
  return (
    <footer className="cx-store__footer">
      <div className="cx-store__footer-main">
        <section className="cx-store__footer-brand">
          <a className="cx-store__footer-logo" href="/">
            <ShoppingBagIcon />
            <strong>CXShop</strong>
          </a>
          <p>
            {navigation?.about ??
              "Reliable technology, practical buying guidance, and business-ready support for work, study, and creativity."}
          </p>
          <div className="cx-store__socials" aria-label="Social links">
            <a
              aria-label="LinkedIn"
              href="https://www.linkedin.com"
              rel="noreferrer"
              target="_blank"
            >
              <Globe2Icon />
            </a>
            <a
              aria-label="Instagram"
              href="https://www.instagram.com"
              rel="noreferrer"
              target="_blank"
            >
              <CameraIcon />
            </a>
            <a aria-label="X" href="https://x.com" rel="noreferrer" target="_blank">
              <AtSignIcon />
            </a>
          </div>
        </section>
        {groups.map((group) => (
          <FooterColumn
            title={group.title}
            links={group.links.map((link) => [link.label, link.href])}
            key={group.title}
          />
        ))}
      </div>
      <div className="cx-store__footer-support">
        <a href="/login">
          <UserRoundIcon size={17} /> Customer portal
        </a>
        <a href="/contact">
          <HeadphonesIcon size={17} /> Support
        </a>
        <a
          href={whatsappLink("Hello CXShop, I need help choosing a product.")}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircleIcon size={17} /> WhatsApp enquiry
        </a>
      </div>
      <div className="cx-store__footer-bottom">
        <span>
          Â© {new Date().getFullYear()} {navigation?.copyrightOwner ?? "CXShop"}. All rights
          reserved.
        </span>
        <span>Secure commerce powered by CODEXSUN</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <section className="cx-store__footer-column">
      <strong>{title}</strong>
      {links.map(([label, href]) => (
        <a href={href} key={href}>
          {label}
        </a>
      ))}
    </section>
  );
}
const defaultFooterGroups = [
  { title: "Shop", links: [{ label: "All products", href: "/shop" }] },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" }
    ]
  },
  { title: "Help", links: [{ label: "Contact", href: "/contact" }] },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="cx-store__section-title">
      <div>
        <span>{label}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}
