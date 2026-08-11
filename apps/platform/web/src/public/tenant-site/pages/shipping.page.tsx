import { PackageCheck, Route, Truck } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantShippingPage() {
  return (
    <TenantSiteTemplate activePage="shipping" pageTitle="Shipping">
      <TenantPageIntro
        eyebrow="Shipping information"
        title="Clear delivery expectations from checkout to arrival."
        summary="Availability, dispatch estimates, delivery coverage, and any product-specific charges are confirmed before an order is completed."
      />
      <section className="tenant-page-section tenant-principle-grid">
        <article>
          <PackageCheck />
          <h3>Order confirmation</h3>
          <p>
            We confirm the product, delivery address, contact details, and expected dispatch window.
          </p>
        </article>
        <article>
          <Truck />
          <h3>Tracked delivery</h3>
          <p>Tracking details are shared when the carrier accepts the shipment.</p>
        </article>
        <article>
          <Route />
          <h3>Delivery exceptions</h3>
          <p>
            Remote locations, large equipment, and installation services can require additional
            time.
          </p>
        </article>
      </section>
    </TenantSiteTemplate>
  );
}
