import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  getStorefrontAnnouncement,
  getStorefrontBranding,
  getStorefrontDiscovery,
  getStorefrontProduct,
  getStorefrontSiteNavigation,
  listLatestBlogPosts,
  listStorefrontProducts
} from "./storefront.services";
import {
  BackToTopButton,
  BrandsSection,
  BlogSolutionsSection,
  CatalogFilters,
  HeroSlider,
  HomeClosingCta,
  ProductCard,
  PromotionsSection,
  StoreFooter
} from "./storefront.components";
import { StoreHeader } from "./storefront.navigation";
import type {
  StorefrontAnnouncement,
  StorefrontBranding,
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontProductDetail,
  StorefrontBlogPost,
  StorefrontSiteNavigation
} from "./storefront.types";
import { hasStorefrontPrice, money, whatsappLink } from "./storefront.formatters";
import "./storefront.css";
import { PikoStoreAssistant } from "./storefront.assistant";
import { addStorefrontCartItem } from "./storefront.cart";
import { StorefrontCartPage } from "./storefront.cart.page";
import { useStorefrontCatalog } from "./storefront.catalog";

const emptyDiscovery: StorefrontDiscovery = {
  brands: [],
  categories: [],
  priceRange: { maximum: 0, minimum: 0 }
};

export function StorefrontPage() {
  const path = window.location.pathname;
  const productSlug = path.startsWith("/shop/product/") ? decodeURIComponent(path.slice(14)) : "";
  const category = path.startsWith("/shop/category/") ? decodeURIComponent(path.slice(15)) : "";
  const page = productSlug ? (
    <ProductPage slug={productSlug} />
  ) : path === "/cart" ? (
    <StorefrontCartPage />
  ) : path === "/search" || category ? (
    <CatalogPage category={category} searchPage />
  ) : (
    <CatalogPage category="" />
  );
  return (
    <>
      {page}
      <PikoStoreAssistant />
    </>
  );
}

function CatalogPage({ category, searchPage = false }: { category: string; searchPage?: boolean }) {
  const initialSearch = new URLSearchParams(window.location.search).get("q") ?? "";
  const initialScope = searchScope();
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [filters, setFilters] = useState<StorefrontFilters>({
    ...defaultFilters(category, searchPage ? initialSearch : ""),
    scope: searchPage ? initialScope : "all"
  });
  const loadMoreMarker = useRef<HTMLDivElement>(null);
  const [blogPosts, setBlogPosts] = useState<StorefrontBlogPost[]>([]);
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);

  useEffect(() => {
    getStorefrontDiscovery().then(setDiscovery);
    getStorefrontSiteNavigation().then(setSiteNavigation);
    getStorefrontAnnouncement().then(setAnnouncement);
    getStorefrontBranding().then(setBranding);
    if (!searchPage) listLatestBlogPosts().then((items) => setBlogPosts(items.slice(0, 3)));
  }, [searchPage]);
  useEffect(() => {
    if (branding?.brandName) document.title = branding.brandName;
  }, [branding?.brandName]);
  const { error, hasMore, loading, loadingMore, loadMore, products } =
    useStorefrontCatalog(filters);
  useEffect(() => {
    const marker = loadMoreMarker.current;
    if (!marker || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const featured = useMemo(() => products.filter((item) => item.featured).slice(0, 4), [products]);
  const promotions = useMemo(
    () => products.filter((item) => item.compareAtPrice != null).slice(0, 4),
    [products]
  );
  return (
    <div className="cx-store">
      <StoreHeader
        announcement={announcement}
        branding={branding}
        discovery={discovery}
        filters={filters}
      />
      <main className={searchPage ? "cx-store__search-main" : undefined}>
        {!searchPage ? <HeroSlider products={featured} /> : null}
        {!searchPage ? <PromotionsSection products={promotions} /> : null}
        {!searchPage ? <BrandsSection brands={discovery.brands} /> : null}
        {!searchPage && featured.length ? (
          <ProductSection
            brandName={branding?.brandName}
            label="Featured products"
            products={featured}
            title="Selected systems worth a closer look"
            whatsappNumber={branding?.primaryPhone}
          />
        ) : null}
        <section className="cx-store__catalog" id="catalog">
          <div className="cx-store__section-title">
            <div>
              <span>{searchPage ? "Search and filter" : "The complete collection"}</span>
              <h2>
                {loading ? "Loading products…" : `${products.length} products ready to explore`}
              </h2>
            </div>
            {searchPage ? (
              <button onClick={() => setFilters(defaultFilters("", ""))}>Clear all</button>
            ) : null}
          </div>
          <div className={searchPage ? "cx-store__catalog-layout" : "cx-store__catalog-full"}>
            {searchPage ? (
              <CatalogFilters discovery={discovery} filters={filters} onFilters={setFilters} />
            ) : null}
            <div>
              <div className="cx-store__grid">
                {loading ? <ProductSkeletons count={8} /> : null}
                {products.map((item) => (
                  <ProductCard
                    brandName={branding?.brandName}
                    key={item.slug}
                    product={item}
                    whatsappNumber={branding?.primaryPhone}
                  />
                ))}
                {loadingMore ? <ProductSkeletons count={4} /> : null}
              </div>
              <div ref={loadMoreMarker} className="cx-store__load-marker" aria-hidden="true" />
              {!loading && products.length === 0 ? (
                <p className="cx-store__empty">
                  {error || "No products match this selection."}
                </p>
              ) : null}
            </div>
          </div>
        </section>
        {!searchPage ? (
          <BlogSolutionsSection brandName={branding?.brandName} posts={blogPosts} />
        ) : null}
        {!searchPage ? <HomeClosingCta /> : null}
      </main>
      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

function ProductSkeletons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div className="cx-product-skeleton" key={index} aria-hidden="true">
      <div className="cx-product-skeleton__image" />
      <div className="cx-product-skeleton__line cx-product-skeleton__line--short" />
      <div className="cx-product-skeleton__line" />
      <div className="cx-product-skeleton__line" />
    </div>
  ));
}

function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [similarProducts, setSimilarProducts] = useState<StorefrontProduct[]>([]);
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [error, setError] = useState("");
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);
  useEffect(() => {
    Promise.all([getStorefrontProduct(slug), getStorefrontDiscovery()])
      .then(async ([item, data]) => {
        setProduct(item);
        setDiscovery(data);
        const related = await listStorefrontProducts(defaultFilters(item.category, ""));
        setSimilarProducts(related.filter((candidate) => candidate.slug !== item.slug).slice(0, 4));
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Product unavailable")
      );
  }, [slug]);
  useEffect(() => {
    Promise.all([
      getStorefrontSiteNavigation(),
      getStorefrontAnnouncement(),
      getStorefrontBranding()
    ]).then(([navigation, activeAnnouncement, activeBranding]) => {
      setSiteNavigation(navigation);
      setAnnouncement(activeAnnouncement);
      setBranding(activeBranding);
    });
  }, []);
  const header = (
    <StoreHeader
      announcement={announcement}
      branding={branding}
      discovery={discovery}
      filters={defaultFilters("", "")}
    />
  );
  if (error)
    return (
      <div className="cx-store">
        {header}
        <main className="cx-store__empty">{error}</main>
      </div>
    );
  if (!product)
    return (
      <div className="cx-store">
        {header}
        <main className="cx-store__empty">Loading product…</main>
      </div>
    );
  const enquiry = whatsappLink(
    `Hello${branding?.brandName ? ` ${branding.brandName}` : ""}, I would like to know more about ${product.name}.`,
    branding?.primaryPhone
  );
  const priced = hasStorefrontPrice(product.price);
  const bulletPoints = product.bulletPoints.filter(Boolean);
  const hasPolicies = Boolean(product.warranty || product.returnPolicy);
  return (
    <div className="cx-store">
      {header}
      <main className="cx-detail">
        <button
          className="cx-detail__back"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.assign("/shop");
          }}
          type="button"
        >
          <ArrowLeftIcon aria-hidden="true" /> Back
        </button>
        <div className="cx-detail__image">
          <img src={product.imageUrl} alt={product.imageAlt} />
        </div>
        <div className="cx-detail__copy">
          {product.category ? (
            <a href={`/shop/category/${encodeURIComponent(product.category)}`}>
              {product.category}
            </a>
          ) : null}
          <h1>{product.name}</h1>
          {product.shortDescription ? (
            <p className="cx-detail__subtitle">{product.shortDescription}</p>
          ) : null}
          {priced ? (
            <div className="cx-detail__price">
              <strong>{money(product.price)}</strong>
              {hasStorefrontPrice(product.compareAtPrice) ? (
                <del>{money(product.compareAtPrice ?? product.price)}</del>
              ) : null}
            </div>
          ) : null}
          {product.description ? <p>{product.description}</p> : null}
          {bulletPoints.length ? (
            <ul>
              {bulletPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          <div className="cx-detail__actions">
            {priced ? (
              <button onClick={() => addStorefrontCartItem(product)} type="button">
                Add to basket
              </button>
            ) : null}
            <a className="cx-detail__whatsapp" href={enquiry} rel="noreferrer" target="_blank">
              Enquire on WhatsApp
            </a>
          </div>
          {hasPolicies ? (
            <div className="cx-detail__policy">
              {product.warranty ? (
                <span>
                  <strong>Warranty</strong>
                  {product.warranty}
                </span>
              ) : null}
              {product.returnPolicy ? (
                <span>
                  <strong>Returns</strong>
                  {product.returnPolicy}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {similarProducts.length ? (
          <div className="cx-detail__similar">
            <ProductSection
              brandName={branding?.brandName}
              label="Similar items"
              products={similarProducts}
              title="More products you may like"
              whatsappNumber={branding?.primaryPhone}
            />
          </div>
        ) : null}
      </main>
      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

function ProductSection({
  brandName,
  label,
  products,
  title,
  whatsappNumber
}: {
  brandName?: string | undefined;
  label: string;
  products: StorefrontProduct[];
  title: string;
  whatsappNumber?: string | null | undefined;
}) {
  return (
    <section className="cx-store__featured-products">
      <div className="cx-store__section-title">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        <a href="/search?sort=featured">
          <span>Browse and filter all</span>
          <ArrowRightIcon aria-hidden="true" />
        </a>
      </div>
      <div className="cx-store__grid">
        {products.map((product) => (
          <ProductCard
            brandName={brandName}
            key={product.slug}
            product={product}
            whatsappNumber={whatsappNumber}
          />
        ))}
      </div>
    </section>
  );
}

function searchScope(): StorefrontFilters["scope"] {
  const value = new URLSearchParams(window.location.search).get("scope");
  return value === "products" || value === "brands" || value === "categories" ? value : "all";
}

function defaultFilters(category: string, search: string): StorefrontFilters {
  return {
    brand: "",
    category,
    maxPrice: null,
    minPrice: null,
    scope: "all",
    search,
    sort: "featured"
  };
}
