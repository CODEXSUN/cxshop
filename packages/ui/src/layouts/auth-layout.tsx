import type { ReactNode } from "react";

import { Building2, Crown, Headphones } from "lucide-react";

import { cn } from "../lib/utils";

type AuthLayoutProps = {
  afterCard?: ReactNode;
  children: ReactNode;
  description?: string;
  surface?: "admin" | "sa" | "tenant";
  title: string;
  brandName?: string | undefined;
  logoDarkSrc?: string | null | undefined;
  logoSrc?: string | null | undefined;
};

export function AuthLayout({
  afterCard,
  brandName = "CXShop",
  children,
  description,
  logoDarkSrc,
  logoSrc,
  surface,
  title
}: AuthLayoutProps) {
  const resolvedSurface = surface ?? surfaceFromTitle(title);
  const isTenant = resolvedSurface === "tenant";
  const nextDescription =
    description ??
    (isTenant
      ? "Access your workspace with your registered credentials."
      : "Use your admin email and password for this desk.");

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label={title}>
        <div className="auth-brand">
          <SurfaceMark logoDarkSrc={logoDarkSrc} logoSrc={logoSrc} surface={resolvedSurface} />
          <strong>{brandName}</strong>
        </div>
        <div className="auth-content">
          <div className={cn("auth-card-frame", `auth-card-frame-${resolvedSurface}`)}>
            <div className="auth-card">
              <header className="auth-card-header">
                <h1>Welcome</h1>
                <p>{nextDescription}</p>
              </header>
              {children}
            </div>
          </div>
          {afterCard}
        </div>
      </section>
    </main>
  );
}

function surfaceFromTitle(title: string): "admin" | "sa" | "tenant" {
  const normalized = title.toLowerCase();
  if (normalized.includes("super")) return "sa";
  if (normalized.includes("admin")) return "admin";
  return "tenant";
}

function SurfaceMark({
  logoDarkSrc,
  logoSrc,
  surface
}: {
  logoDarkSrc?: string | null | undefined;
  logoSrc?: string | null | undefined;
  surface: "admin" | "sa" | "tenant";
}) {
  const Icon = surface === "sa" ? Crown : surface === "admin" ? Headphones : Building2;
  return (
    <span className="auth-surface-mark" data-surface={surface}>
      <img
        className="auth-logo-image dark:hidden"
        src={logoSrc ?? "/icons/logo.svg"}
        alt=""
        aria-hidden="true"
      />
      <img
        className="auth-logo-image hidden dark:block"
        src={logoDarkSrc ?? logoSrc ?? "/icons/logo-dark.svg"}
        alt=""
        aria-hidden="true"
      />
      <span className="auth-surface-badge">
        <Icon size={13} strokeWidth={2.25} />
      </span>
    </span>
  );
}
