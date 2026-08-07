import "@cxshop/ui/styles.css";
import "@cxshop/ui/auth-login.css";
import "@cxshop/ui/auth-layout-fixes.css";
import "@cxshop/ui/portal-switcher.css";
import "@cxshop/ui/state-pages.css";
import "@cxshop/ui/business-assist.css";
import "@cxshop/ui/catalog.css";
import "@cxshop/ui/mega-menu.css";
import "@cxshop/ui/product-slider.css";
import "@cxshop/ui/backoffice.css";
import "@cxshop/ui/walk-in-sales.css";
export const metadata = { title: { default: "CXShop", template: "%s · CXShop" }, description: "Multi-vendor marketplace" };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
