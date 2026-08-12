import type { ReactNode } from "react";

type WebLayoutProps = {
  children: ReactNode;
  brandName?: string | undefined;
  logoSrc?: string | null | undefined;
};

export function WebLayout({ brandName = "CXShop", children, logoSrc }: WebLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-6 lg:px-8">
        <a className="flex items-center gap-2 text-sm font-semibold" href="/">
          {logoSrc ? (
            <img alt="" aria-hidden="true" className="size-7 object-contain" src={logoSrc} />
          ) : null}
          {brandName}
        </a>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a href="/status">Status</a>
          <a href="/">Storefront</a>
          <a href="/admin/login">Back Office</a>
          <a href="/sa/login">Super Admin</a>
        </div>
      </nav>
      {children}
    </main>
  );
}
