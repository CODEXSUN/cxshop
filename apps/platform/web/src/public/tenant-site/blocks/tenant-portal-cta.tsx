import { ArrowRight, ExternalLink } from "lucide-react";
import { useTenantSite } from "../tenant-site.context";

export function TenantPortalCta({
  summary = "Tell us what you need to achieve. We will help you choose a practical product, service, or business technology solution.",
  title = "Need technology that fits the real requirement?"
}: {
  summary?: string;
  title?: string;
}) {
  const { portal } = useTenantSite();

  return (
    <section className="tenant-portal-cta">
      <div>
        <span>Talk to {portal.brandName}</span>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
      <div className="tenant-portal-actions">
        <a className="tenant-portal-primary" href="/shop">
          Explore products <ArrowRight />
        </a>
        {portal.publicSiteUrl ? (
          <a className="tenant-portal-secondary" href={portal.publicSiteUrl}>
            Contact Tech Media <ExternalLink />
          </a>
        ) : null}
      </div>
    </section>
  );
}
