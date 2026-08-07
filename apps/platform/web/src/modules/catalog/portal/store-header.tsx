import { Search, UserRound } from "lucide-react";
import { StoreMegaMenu } from "./store-mega-menu";

export function StoreHeader() {
  return <><div className="store-notice"><span>Computer parts and systems for home, work, and business</span><nav><a href="/vendor">Sell on CXShop</a><a href="/admin">Back office</a><a href="/account">My account</a></nav></div><header className="store-header">
    <a className="store-brand" href="/"><span className="store-mark">CX</span><span>CXShop<small>Computer store</small></span></a>
    <form action="/search" className="store-search"><Search size={19}/><input aria-label="Search products" name="q" placeholder="Search laptops, parts, monitors and accessories"/><button type="submit">Search</button></form>
    <div className="store-actions"><a href="/account"><UserRound size={21}/><span>Account<small>Sign in</small></span></a></div>
  </header><StoreMegaMenu/></>;
}

export function StoreFooter() {
  return <footer className="store-footer"><div><strong>CXShop Computer Store</strong><p>Computer systems, components, spares, and accessories from verified marketplace sellers.</p></div><div><a href="/account">Account</a><a href="/vendor">Vendor desk</a><a href="/admin">Back office</a></div><small>Product records are test catalog data. Seller offer pricing and availability remain separate.</small></footer>;
}
