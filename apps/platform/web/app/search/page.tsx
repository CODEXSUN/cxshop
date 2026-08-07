import { getProducts } from "../../src/modules/catalog/catalog-api";
import { ProductCard } from "../../src/modules/catalog/portal/product-card";
import { StoreFooter, StoreHeader } from "../../src/modules/catalog/portal/store-header";

export const metadata = { title: "Search computer products", robots: { index: false } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? "";
  const products = (await getProducts()).filter(product => `${product.name} ${product.summary} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="store-page"><StoreHeader/><main className="listing-page"><header><p className="store-kicker">Product search</p><h1>{query ? `Results for “${query}”` : "Search the catalog"}</h1><p>{products.length} matching computer products.</p></header><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div></main><StoreFooter/></div>;
}
