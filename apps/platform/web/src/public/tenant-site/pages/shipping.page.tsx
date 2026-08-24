import { PackageCheck, Route, Truck } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantShippingPage() {
  return (
    <TenantSiteTemplate activePage="shipping" pageTitle="Shipping and Delivery Policy">
      <TenantPageIntro eyebrow="Shipping and delivery" title="Clear delivery information before your order is confirmed." summary="Tech Media confirms stock, delivery coverage, charges, and the estimated dispatch date for each order. Delivery times can vary by product and destination." />
      <section className="tenant-page-section tenant-principle-grid">
        <article><PackageCheck /><h3>Order confirmation</h3><p>We confirm the item, quantity, price, address, phone number, payment, and delivery estimate.</p></article>
        <article><Truck /><h3>Dispatch and tracking</h3><p>In-stock products usually dispatch after payment confirmation. We share carrier details when available.</p></article>
        <article><Route /><h3>Large or installed products</h3><p>Servers, displays, infrastructure, and products that need installation may use a scheduled delivery.</p></article>
      </section>
      <section className="tenant-page-section tenant-prose">
        <article><span>01</span><div><h2>Delivery coverage</h2><p>We deliver to serviceable Indian addresses. Some remote locations may need collection from the carrier hub or a different arrangement.</p></div></article>
        <article><span>02</span><div><h2>Charges and time</h2><p>Shipping charges and delivery estimates appear during confirmation. They do not include delays caused by weather, carrier disruption, public holidays, or an incorrect address.</p></div></article>
        <article><span>03</span><div><h2>Inspect the package</h2><p>Check the outer package at delivery. Record visible damage before opening and contact Order Help promptly with photographs and the order reference.</p></div></article>
        <article><span>04</span><div><h2>Store pickup</h2><p>Orders marked for pickup can be collected at 436, Avinashi Road, Tiruppur after confirmation. Bring the order reference and valid identification.</p></div></article>
      </section>
    </TenantSiteTemplate>
  );
}
