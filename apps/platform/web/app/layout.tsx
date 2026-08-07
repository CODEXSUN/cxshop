import "@cxshop/ui/styles.css";
import "@cxshop/ui/auth-login.css";
import "@cxshop/ui/auth-layout-fixes.css";
import "@cxshop/ui/portal-switcher.css";
import "@cxshop/ui/state-pages.css";
import "@cxshop/ui/business-assist.css";
export const metadata = { title: { default: "CXShop", template: "%s · CXShop" }, description: "Multi-vendor marketplace" };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
