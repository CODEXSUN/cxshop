import { ClipboardCheck, PackageOpen, RotateCcw } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantReturnsPage() {
  return (
    <TenantSiteTemplate activePage="returns" pageTitle="Returns and refunds">
      <TenantPageIntro
        eyebrow="Returns and refunds"
        title="A straightforward review process when a product is not right."
        summary="Contact support with the order reference and product condition. Eligibility depends on the product, elapsed time, activation state, and manufacturer policy."
      />
      <section className="tenant-page-section tenant-principle-grid">
        <article>
          <ClipboardCheck />
          <h3>Request a review</h3>
          <p>
            Share the order reference, reason, photographs where useful, and any troubleshooting
            already completed.
          </p>
        </article>
        <article>
          <PackageOpen />
          <h3>Keep items complete</h3>
          <p>
            Return approved products with original accessories, manuals, serial labels, and safe
            packaging.
          </p>
        </article>
        <article>
          <RotateCcw />
          <h3>Refund processing</h3>
          <p>Approved refunds return through the original payment method after inspection.</p>
        </article>
      </section>
    </TenantSiteTemplate>
  );
}
