import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "../../../src/modules/catalog/catalog-api";
import { ProductCard } from "../../../src/modules/catalog/portal/product-card";
import { StoreFooter, StoreHeader } from "../../../src/modules/catalog/portal/store-header";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find(item => item.slug === slug);
  return category ? { title: category.name, description: category.description } : {};
}
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts(slug)]);
  const category = categories.find(item => item.slug === slug);
  if (!category) notFound();
  return <div className="store-page"><StoreHeader/><main className="listing-page"><a className="back-link" href="/">← All categories</a><header><p className="store-kicker">Category</p><h1>{category.name}</h1><p>{category.description}</p></header><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div></main><StoreFooter/></div>;
}
