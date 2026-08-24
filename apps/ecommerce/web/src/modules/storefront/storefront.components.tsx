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
  StorefrontBranding,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontBlogPost,
  StorefrontSiteNavigation,
  StorefrontSlider
} from "./storefront.types";
import { hasStorefrontPrice, money, whatsappLink } from "./storefront.formatters";

type FilterProps = {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
};

export function HeroSlider({ slides }: { slides: StorefrontSlider[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6800);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const slide = slides[active];
  if (!slide) return null;
  return (
    <section
      aria-label="Storefront highlights"
      aria-roledescription="carousel"
      className="cx-store__hero"
    >
      <div className="cx-store__hero-copy" key={`copy-${slide.sliderCode}`}>
        {slide.eyebrow ? <span className="cx-store__hero-reveal">{slide.eyebrow}</span> : null}
        <h1 className="cx-store__hero-reveal">{slide.title}</h1>
        {slide.description ? <p className="cx-store__hero-reveal">{slide.description}</p> : null}
        <a className="cx-store__hero-reveal" href={slide.actionUrl}>
          {slide.actionLabel}
        </a>
      </div>
      <div className="cx-store__hero-media" key={`media-${slide.sliderCode}`}>
        <img src={slide.imageUrl} alt={slide.imageAlt || slide.title} />
        <div aria-label="Choose storefront highlight" className="cx-store__hero-bullets">
          {slides.map((item, index) => (
            <button
              aria-label={`Show ${item.title}`}
              aria-current={index === active ? "true" : undefined}
              className={index === active ? "is-active" : undefined}
              key={item.sliderCode}
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
        {products.map((product) => {
          const metadata = [product.brand, product.category].filter(Boolean).join(" · ");
          const priced = hasStorefrontPrice(product.price);
          return (
            <a
              className="cx-store__promotion-card"
              href={`/shop/product/${product.slug}`}
              key={product.slug}
            >
              <span className="cx-store__promotion-media">
                <img alt={product.imageAlt || product.name} loading="lazy" src={product.imageUrl} />
                {priced && hasStorefrontPrice(product.compareAtPrice) ? (
                  <span className="cx-store__promotion-saving">
                    Save {money((product.compareAtPrice ?? product.price) - product.price)}
                  </span>
                ) : null}
              </span>
              <span className="cx-store__promotion-copy">
                {metadata ? <small>{metadata}</small> : null}
                <strong>{product.name}</strong>
                <span className="cx-store__promotion-actions">
                  {priced ? (
                    <span className="cx-store__promotion-price">
                      <b>{money(product.price)}</b>
                      {hasStorefrontPrice(product.compareAtPrice) ? (
                        <del>{money(product.compareAtPrice ?? product.price)}</del>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="cx-store__promotion-link">
                    {priced ? "View offer" : "Enquire"}
                  </span>
                </span>
              </span>
            </a>
          );
        })}
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

export function BlogSolutionsSection({
  brandName = "",
  posts
}: {
  brandName?: string | undefined;
  posts: StorefrontBlogPost[];
}) {
  if (!posts.length) return null;
  return (
    <section className="cx-store__blog-solutions" id="solutions">
      <div className="cx-store__latest-heading">
        <div>
          <h2>Latest Posts</h2>
          <p>Practical computer guides from the {brandName} editorial team</p>
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
                <span>{brandName} Journal</span>
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
                  <b>{brandName} Editorial</b>
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

export function ProductCard({
  brandName = "",
  product,
  whatsappNumber
}: {
  brandName?: string | undefined;
  product: StorefrontProduct;
  whatsappNumber?: string | null | undefined;
}) {
  const metadata = [product.brand, product.category].filter(Boolean).join(" · ");
  const priced = hasStorefrontPrice(product.price);
  return (
    <article className="cx-product-card">
      <a href={`/shop/product/${product.slug}`}>
        <div className="cx-product-card__image">
          {product.featured ? <span>Featured</span> : null}
          <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
        </div>
        <div className="cx-product-card__copy">
          {metadata ? <small>{metadata}</small> : null}
          <h3>{product.name}</h3>
          {product.shortDescription ? <p>{product.shortDescription}</p> : null}
        </div>
      </a>
      <div className="cx-product-card__actions">
        {priced ? (
          <div className="cx-product-card__price">
            <strong>{money(product.price)}</strong>
            {hasStorefrontPrice(product.compareAtPrice) ? (
              <del>{money(product.compareAtPrice ?? product.price)}</del>
            ) : null}
          </div>
        ) : null}
        <a
          className="cx-product-card__enquiry"
          href={whatsappLink(
            `Hello ${brandName}, please share details for ${product.name}.`,
            whatsappNumber
          )}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircleIcon size={16} /> Enquire
        </a>
      </div>
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

export function StoreFooter({
  branding,
  navigation
}: {
  branding: StorefrontBranding | null;
  navigation: StorefrontSiteNavigation | null;
}) {
  const groups = navigation?.groups ?? defaultFooterGroups;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <footer className="cx-store__footer">
      <div className="cx-store__footer-main">
        <section className="cx-store__footer-brand">
          <a className="cx-store__footer-logo" href="/">
            <StoreBrandMark branding={branding} dark />
            {branding?.brandName ? <strong>{branding.brandName}</strong> : null}
          </a>
          {navigation?.tagline ? <b>{navigation.tagline}</b> : null}
          {navigation?.about ? <p>{navigation.about}</p> : null}
          <div className="cx-store__socials" aria-label="Social links">
            {navigation?.socialLinks.map((link) => (
              <a
                aria-label={link.label}
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.label === "Instagram" ? (
                  <CameraIcon />
                ) : link.label === "X" ? (
                  <AtSignIcon />
                ) : (
                  <Globe2Icon />
                )}
              </a>
            ))}
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
          href={whatsappLink(
            `Hello${branding?.brandName ? ` ${branding.brandName}` : ""}, I need help choosing a product.`,
            branding?.primaryPhone
          )}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircleIcon size={17} /> WhatsApp enquiry
        </a>
      </div>
      <div className="cx-store__footer-bottom">
        <span>
          © {new Date().getFullYear()} {branding?.brandName ?? ""}
          {navigation?.copyrightText ? `. ${navigation.copyrightText}` : ""}
        </span>
        {navigation?.poweredByText ? <span>{navigation.poweredByText}</span> : null}
      </div>
    </footer>
  );
}

function StoreBrandMark({
  branding,
  dark = false
}: {
  branding: StorefrontBranding | null;
  dark?: boolean;
}) {
  const source = dark ? (branding?.logoDarkUrl ?? branding?.logoUrl) : branding?.logoUrl;
  if (!source) return null;
  return <img alt="" aria-hidden="true" className="cx-store__brand-mark" src={source} />;
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
