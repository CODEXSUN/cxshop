import type { CategoryDto, ProductSummaryDto } from "@cxshop/contracts";
import { ArrowRight, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "../../catalog/portal/product-card";
import { ProductHeroSlider } from "../../catalog/portal/product-hero-slider";
import { StoreFooter, StoreHeader } from "../../catalog/portal/store-header";

export function CustomerPortal({ categories, products }: { categories: CategoryDto[]; products: ProductSummaryDto[] }) {
  return <div className="store-page"><StoreHeader/><main>
    <ProductHeroSlider products={products}/>
    <section className="store-benefits"><div><Truck/><span><strong>Marketplace delivery</strong>Seller fulfilment ready</span></div><div><RotateCcw/><span><strong>Clear return policy</strong>Offer-level terms</span></div><div><ShieldCheck/><span><strong>Verified records</strong>Owned catalog identity</span></div><div><Headphones/><span><strong>Business support</strong>Admin and vendor desks</span></div></section>
    <section className="hardware-categories" id="categories"><header><div><p>Everything for your computer</p><h2>Shop by category</h2></div><a href="#products">Browse all products <ArrowRight size={17}/></a></header><div>{categories.map((category, index) => <a key={category.id} href={`/categories/${category.slug}`}><span>{String(index + 1).padStart(2,"0")}</span><strong>{category.name}</strong><p>{category.description}</p><b>{category.productCount} products <ArrowRight size={15}/></b></a>)}</div></section>
    <section className="promo-grid"><a href="/categories/laptops"><span>Mobile performance</span><h2>Work anywhere<br/>with confidence.</h2><p>Portable systems for study, business, engineering, and creative work.</p><b>Explore laptops <ArrowRight size={16}/></b></a><a href="/categories/components"><span>Build and upgrade</span><h2>Parts for the<br/>next machine.</h2><p>Processors, graphics, memory, cooling, and fast storage.</p><b>Explore components <ArrowRight size={16}/></b></a></section>
    <section className="collection" id="products"><div className="section-heading"><div><p>Computer hardware catalog</p><h2>Featured products</h2></div><p>Real MariaDB-backed test records for storefront, category, product, Admin, and API testing.</p></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div></section>
    <section className="store-newsletter"><div><p>CXShop for business</p><h2>Equip the complete workplace.</h2></div><p>Use the Vendor Desk to prepare seller offers. Use the Admin Desk to govern canonical products and categories.</p><a href="/vendor">Open Vendor Desk <ArrowRight size={17}/></a></section>
  </main><StoreFooter/></div>;
}
