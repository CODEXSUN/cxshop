import type { ProductSummaryDto } from "@cxshop/contracts";
import { ArrowRight, Heart } from "lucide-react";

export function ProductCard({ product }: { product: ProductSummaryDto; priority?: boolean }) {
  return <article className="product-card"><a className="product-art" href={`/products/${product.slug}`}><span className="product-badge">Test catalog</span>{product.imageUrl ? <img alt={product.name} loading="lazy" src={product.imageUrl}/> : <span>{product.name.slice(0, 2)}</span>}</a><div className="product-card-copy"><div><p>{product.category ?? "Computer hardware"}</p><button aria-label={`Save ${product.name}`} disabled><Heart size={17}/></button></div><h3><a href={`/products/${product.slug}`}>{product.name}</a></h3><span>{product.summary}</span><p className="offer-label">Seller offers coming soon</p><a className="product-link" href={`/products/${product.slug}`}>View details <ArrowRight size={15}/></a></div></article>;
}
