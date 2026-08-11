export function TenantSiteLogo({ className }: { className?: string }) {
  return (
    <picture className={className} aria-hidden="true">
      <source media="(prefers-color-scheme: dark)" srcSet="/icons/logo-dark.svg" />
      <img src="/icons/logo.svg" alt="" />
    </picture>
  );
}
