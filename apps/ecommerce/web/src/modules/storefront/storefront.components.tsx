import { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  HeadphonesIcon,
  AtSignIcon,
  CameraIcon,
  MessageCircleIcon,
  MenuIcon,
  Globe2Icon,
  UserRoundIcon,
  XIcon
} from "lucide-react";
import type {
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontBlogPost,
  StorefrontSiteNavigation
} from "./storefront.types";
import { money, whatsappLink } from "./storefront.formatters";

type FilterProps = {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
};

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
                <span>·</span>
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

export function HomeClosingCta() {
  return (
    <section className="cx-store__closing-cta">
      <div>
        <span>Ready when you are</span>
        <h2>Find technology that fits the way you work.</h2>
        <p>Compare dependable systems, accessories, and practical support in one place.</p>
      </div>
      <a href="/shop">
        Browse all products <ArrowUpRightIcon />
      </a>
    </section>
  );
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 480);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <button
      aria-label="Back to top"
      className={`cx-store__back-to-top${visible ? " is-visible" : ""}`}
      onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      <ArrowUpIcon />
    </button>
  );
}

export function StoreFooter({ navigation }: { navigation: StorefrontSiteNavigation | null }) {
  const groups = navigation?.groups ?? defaultFooterGroups;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <footer className="cx-store__footer">
      <div className="cx-store__footer-main">
        <section className="cx-store__footer-brand">
          <a className="cx-store__footer-logo" href="/">
            <StoreBrandMark dark />
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
        <button
          aria-controls="cx-store-footer-menu"
          aria-expanded={menuOpen}
          className="cx-store__footer-menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <span>Explore footer</span>
          {menuOpen ? <XIcon /> : <MenuIcon />}
        </button>
        <div
          className={`cx-store__footer-menu${menuOpen ? " is-open" : ""}`}
          id="cx-store-footer-menu"
        >
          {groups.map((group) => (
            <FooterColumn
              title={group.title}
              links={group.links.map((link) => [link.label, link.href])}
              key={group.title}
            />
          ))}
        </div>
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
          © {new Date().getFullYear()} {navigation?.copyrightOwner ?? "CXShop"}. All rights
          reserved.
        </span>
        <span>Secure commerce powered by CODEXSUN</span>
      </div>
    </footer>
  );
}

function StoreBrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className="cx-store__brand-mark"
      src={dark ? "/icons/logo-dark.svg" : "/icons/logo.svg"}
    />
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
