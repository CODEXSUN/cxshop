"use client";

import type { CategoryDto, ProductSummaryDto } from "@cxshop/contracts";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { FolderTree, PackagePlus, RefreshCw } from "lucide-react";

type View = "products" | "categories";
export function CatalogManager() {
  const [view, setView] = useState<View>("products");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [message, setMessage] = useState("Loading catalog…");
  const load = useCallback(async () => {
    setMessage("Loading catalog…");
    try {
      const [categoryResponse, productResponse] = await Promise.all([fetch("/api/v1/admin/catalog/categories", { credentials: "include" }), fetch("/api/v1/admin/catalog/products", { credentials: "include" })]);
      if (!categoryResponse.ok || !productResponse.ok) throw new Error();
      setCategories(((await categoryResponse.json()) as { items: CategoryDto[] }).items);
      setProducts(((await productResponse.json()) as { items: ProductSummaryDto[] }).items);
      setMessage("");
    } catch { setMessage("The catalog could not be loaded. Check the API and MariaDB connection."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <div className="catalog-admin">
    <div className="catalog-toolbar"><div role="tablist" aria-label="Catalog records"><button className={view === "products" ? "active" : ""} onClick={() => setView("products")}>Products <span>{products.length}</span></button><button className={view === "categories" ? "active" : ""} onClick={() => setView("categories")}>Categories <span>{categories.length}</span></button></div><button className="icon-button" onClick={() => void load()} aria-label="Refresh catalog"><RefreshCw size={17}/></button></div>
    {message && <p className="admin-message">{message}</p>}
    {view === "products" ? <ProductPanel products={products} categories={categories} onSaved={load}/> : <CategoryPanel categories={categories} onSaved={load}/>} 
  </div>;
}

function ProductPanel({ products, categories, onSaved }: { products: ProductSummaryDto[]; categories: CategoryDto[]; onSaved: () => Promise<void> }) {
  return <section className="admin-split"><div><div className="admin-section-title"><div><p>Canonical records</p><h2>Products</h2></div><PackagePlus size={22}/></div><div className="data-list">{products.map(product => <article key={product.id}><span className="record-monogram">{product.name.slice(0, 1)}</span><div><strong>{product.name}</strong><p>{product.key} · {product.category ?? "Uncategorized"}</p></div><span className={`status status-${product.status}`}>{product.status}</span></article>)}</div></div><CreateProduct categories={categories} onSaved={onSaved}/></section>;
}

function CategoryPanel({ categories, onSaved }: { categories: CategoryDto[]; onSaved: () => Promise<void> }) {
  return <section className="admin-split"><div><div className="admin-section-title"><div><p>Store navigation</p><h2>Categories</h2></div><FolderTree size={22}/></div><div className="data-list">{categories.map(category => <article key={category.id}><span className="record-monogram">{category.name.slice(0, 1)}</span><div><strong>{category.name}</strong><p>/{category.slug} · {category.productCount} products</p></div><span className={`status status-${category.status}`}>{category.status}</span></article>)}</div></div><CreateCategory onSaved={onSaved}/></section>;
}

function CreateCategory({ onSaved }: { onSaved: () => Promise<void> }) {
  return <RecordForm title="Add category" submitLabel="Create category" endpoint="/api/v1/admin/catalog/categories" onSaved={onSaved} fields={<><Field name="name" label="Name"/><Field name="slug" label="URL slug"/><Field name="description" label="Description"/><StatusField/></>}/>;
}

function CreateProduct({ categories, onSaved }: { categories: CategoryDto[]; onSaved: () => Promise<void> }) {
  return <RecordForm title="Add product" submitLabel="Create product" endpoint="/api/v1/admin/catalog/products" onSaved={onSaved} fields={<><Field name="key" label="Product key"/><Field name="name" label="Name"/><Field name="slug" label="URL slug"/><Field name="summary" label="Short summary"/><label>Description<textarea name="description" required minLength={20}/></label><label>Primary category<select name="categoryId" required defaultValue=""><option value="" disabled>Select category</option>{categories.filter(item => item.status !== "archived").map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><StatusField/></>}/>;
}

function RecordForm({ title, submitLabel, endpoint, fields, onSaved }: { title: string; submitLabel: string; endpoint: string; fields: React.ReactNode; onSaved: () => Promise<void> }) {
  const [state, setState] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("Saving…");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(endpoint, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) return setState("Could not save. Check unique keys and required values.");
    form.reset(); setState("Saved."); await onSaved();
  }
  return <aside className="record-form"><p>New record</p><h2>{title}</h2><form onSubmit={submit}>{fields}<button type="submit">{submitLabel}</button>{state && <span role="status">{state}</span>}</form></aside>;
}

function Field({ name, label }: { name: string; label: string }) { return <label>{label}<input name={name} required/></label>; }
function StatusField() { return <label>Publishing status<select name="status" defaultValue="draft"><option value="draft">Draft</option><option value="active">Active</option></select></label>; }
