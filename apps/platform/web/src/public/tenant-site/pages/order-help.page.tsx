import { ClipboardCheck, PackageSearch, Truck } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantOrderHelpPage() {
  return (
    <TenantSiteTemplate activePage="order-help" pageTitle="Order Help">
      <TenantPageIntro eyebrow="Order help" title="Get help with confirmation, delivery, damage, return, or warranty." summary="Keep your order reference and the phone number used for the order ready. Call +91 98946 44450 or send the details through WhatsApp." />
      <section className="tenant-page-section tenant-principle-grid">
        <article><ClipboardCheck /><h3>Before dispatch</h3><p>Contact us to correct eligible address or contact details before the carrier receives the order.</p></article>
        <article><Truck /><h3>Delivery update</h3><p>Share the order reference so we can check dispatch, tracking, and carrier information.</p></article>
        <article><PackageSearch /><h3>Damage or wrong item</h3><p>Keep the packaging and contact us promptly with photographs, serial details, and an unboxing video if available.</p></article>
      </section>
    </TenantSiteTemplate>
  );
}
