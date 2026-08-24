import { ClipboardCheck, PackageOpen, RotateCcw } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantReturnsPage() {
  return (
    <TenantSiteTemplate activePage="returns" pageTitle="Returns, Replacements and Refunds">
      <TenantPageIntro eyebrow="Returns and refunds" title="Contact us within 7 days if an eligible product arrives damaged, defective, or incorrect." summary="Approval depends on inspection, product condition, activation, hygiene or licensing restrictions, and the manufacturer policy. Contact us before sending any product back." />
      <section className="tenant-page-section tenant-principle-grid">
        <article><ClipboardCheck /><h3>Request approval</h3><p>Share the order reference, serial number, problem description, photographs, and unboxing video where available.</p></article>
        <article><PackageOpen /><h3>Keep everything complete</h3><p>Keep the box, accessories, manuals, labels, free items, and purchase document in good condition.</p></article>
        <article><RotateCcw /><h3>Inspection and outcome</h3><p>After inspection, we may arrange a replacement, repair, store credit, or eligible refund.</p></article>
      </section>
      <section className="tenant-page-section tenant-prose">
        <article><span>01</span><div><h2>Products that cannot usually be returned</h2><p>Activated software, digital licenses, opened consumables, custom-built systems, configured business equipment, and physically damaged products are normally excluded unless defective.</p></div></article>
        <article><span>02</span><div><h2>Change-of-mind requests</h2><p>We review unopened standard products individually. The customer pays return transport and any loss in value unless Tech Media agrees otherwise in writing.</p></div></article>
        <article><span>03</span><div><h2>Warranty claims</h2><p>After the return window, the brand or manufacturer warranty usually applies. We can help route an eligible warranty request.</p></div></article>
        <article><span>04</span><div><h2>Refund timing</h2><p>Approved refunds use the original payment method where possible. Bank and payment-provider processing times apply after approval.</p></div></article>
      </section>
    </TenantSiteTemplate>
  );
}
