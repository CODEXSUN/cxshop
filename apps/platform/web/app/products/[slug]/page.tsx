import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, PackageCheck } from "lucide-react";
import { getProduct } from "../../../src/modules/catalog/catalog-api";
import { StoreFooter, StoreHeader } from "../../../src/modules/catalog/portal/store-header";
import { WhatsAppEnquiry } from "../../../src/modules/walk-in-sales/portal/whatsapp-enquiry";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.summary, openGraph: { title: product.name, description: product.summary, type: "website" } } : {};
}
export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const structuredData = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.summary, sku: product.variants[0]?.sku };
  return <div className="store-page"><StoreHeader/><main className="product-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/><a className="back-link" href="/#products">← Back to computer catalog</a><section><div className="product-visual">{product.imageUrl ? <img alt={product.name} src={product.imageUrl}/> : <span>{product.name.slice(0,2)}</span>}</div><div className="product-copy"><p className="store-kicker">{product.category ?? "Computer hardware"}</p><h1>{product.name}</h1><p className="product-lead">{product.summary}</p><div className="variant-row">{product.variants.map(variant => <span key={variant.id}><Check size={15}/>{variant.name}</span>)}</div><p>{product.description}</p><div className="offer-pending"><PackageCheck size={22}/><div><strong>Manual store confirmation</strong><span>Send an enquiry. Staff confirm price and availability, prepare the bill, and tell you when collection is ready.</span></div></div><WhatsAppEnquiry productId={product.id} productName={product.name} variants={product.variants}/></div></section></main><StoreFooter/></div>;
}
