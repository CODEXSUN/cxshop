import { useTenantSite } from "../tenant-site.context";

export function TenantSiteLogo({ className }: { className?: string }) {
  const { portal } = useTenantSite();
  return (
    <picture className={className} aria-hidden="true">
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={portal.logoDarkUrl ?? portal.logoUrl ?? "/icons/logo-dark.svg"}
      />
      <img src={portal.logoUrl ?? "/icons/logo.svg"} alt="" />
    </picture>
  );
}
