import { useEffect, useMemo, useState } from "react";
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
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [filters, setFilters] = useState<StorefrontFilters>({
    ...defaultFilters(category, searchPage ? initialSearch : ""),
    scope: searchPage ? initialScope : "all"
  });
  const [loading, setLoading] = useState(true);
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
  useEffect(() => {
    setLoading(true);
    listStorefrontProducts(filters)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filters]);

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
            label="Featured products"
            products={featured}
            title="Selected systems worth a closer look"
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
                {products.map((item) => (
                  <ProductCard brandName={branding?.brandName} key={item.slug} product={item} />
                ))}
              </div>
              {!loading && products.length === 0 ? (
                <p className="cx-store__empty">No products match this selection.</p>
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
    `Hello${branding?.brandName ? ` ${branding.brandName}` : ""}, I would like to know more about ${product.name}.`
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
            <a href={`/shop/category/${encodeURIComponent(product.category)}`}>{product.category}</a>
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
          {bulletPoints.length ? <ul>
            {bulletPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul> : null}
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
          {hasPolicies ? <div className="cx-detail__policy">
            {product.warranty ? <span>
              <strong>Warranty</strong>
              {product.warranty}
            </span> : null}
            {product.returnPolicy ? <span>
              <strong>Returns</strong>
              {product.returnPolicy}
            </span> : null}
          </div> : null}
        </div>
        {similarProducts.length ? (
          <div className="cx-detail__similar">
            <ProductSection
              label="Similar items"
              products={similarProducts}
              title="More products you may like"
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
  label,
  products,
  title
}: {
  label: string;
  products: StorefrontProduct[];
  title: string;
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
          <ProductCard key={product.slug} product={product} />
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
