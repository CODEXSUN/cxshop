"use client";

import { useEffect, useState } from "react";
import type { ProductSummaryDto } from "@cxshop/contracts";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Motion = "fade" | "fly-left" | "fly-right" | "rise" | "still";
type Slide = { eyebrow: string; title: string; copy: string; href: string; action: string; imageUrl: string | null; productName: string; layers: { copy: Motion; action: Motion; image: Motion; badge: Motion } };

const motions: Slide["layers"][] = [
  { copy: "fly-left", action: "rise", image: "fly-right", badge: "fade" },
  { copy: "rise", action: "fly-left", image: "fade", badge: "fly-right" },
  { copy: "fade", action: "rise", image: "fly-right", badge: "fly-left" }
];

export function ProductHeroSlider({ products }: { products: ProductSummaryDto[] }) {
  const slides = makeSlides(products);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function select(index: number) { setActive((index + slides.length) % slides.length); }

  return <section aria-label="Featured products" aria-roledescription="carousel" className="product-hero-slider" onBlur={() => setPaused(false)} onFocus={() => setPaused(true)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="hero-slides">{slides.map((slide, index) => <article aria-hidden={index !== active} className={`hero-slide${index === active ? " is-active" : ""}`} key={slide.productName}>
      <div className={`hero-copy-layer motion-${slide.layers.copy}`}><span>{slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.copy}</p></div>
      <a className={`hero-action-layer motion-${slide.layers.action}`} href={slide.href}>{slide.action}<ArrowRight size={18}/></a>
      <div className={`hero-image-layer motion-${slide.layers.image}`}>{slide.imageUrl && <img alt={slide.productName} src={slide.imageUrl}/>}</div>
      <span className={`hero-badge-layer motion-${slide.layers.badge}`}>Featured product</span>
    </article>)}</div>
    <div className="hero-slider-controls"><button aria-label="Previous product" onClick={() => select(active - 1)} type="button"><ArrowLeft size={18}/></button><div>{slides.map((slide, index) => <button aria-label={`Show ${slide.productName}`} aria-pressed={active === index} key={slide.productName} onClick={() => select(index)} type="button"/> )}</div><span>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span><button aria-label="Next product" onClick={() => select(active + 1)} type="button"><ArrowRight size={18}/></button></div>
  </section>;
}

function makeSlides(products: ProductSummaryDto[]): Slide[] {
  const selected = products.filter(product => product.imageUrl).slice(0, 3);
  if (selected.length === 0) return [{ eyebrow: "Computer store", title: "Build faster. Work smarter.", copy: "Explore dependable systems, components, upgrades, and spares.", href: "/#products", action: "Browse products", imageUrl: null, productName: "Computer catalog", layers: motions[0]! }];
  return selected.map((product, index) => ({
    eyebrow: product.category ?? "Computer hardware",
    title: product.name,
    copy: product.summary,
    href: `/products/${product.slug}`,
    action: "View product",
    imageUrl: product.imageUrl,
    productName: product.name,
    layers: motions[index % motions.length]!
  }));
}
