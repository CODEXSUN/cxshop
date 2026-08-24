import { MessageSquareText, Phone, Wrench } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantSupportPage() {
  return (
    <TenantSiteTemplate activePage="support" pageTitle="Computer Service and Support in Tiruppur">
      <TenantPageIntro eyebrow="Tech Media support" title="Reach a local team for product, service, warranty, and business IT support." summary="Call or message us with the product, serial number, purchase details, symptoms, and any troubleshooting already completed. Do not send passwords or one-time codes." />
      <section className="tenant-page-section tenant-contact-grid">
        <article><Phone /><span>Call support</span><h2>+91 98946 44450</h2><p>Use this number for service, warranty assistance, and urgent business technology questions.</p><a href="tel:+919894644450">Call Tech Media</a></article>
        <article><MessageSquareText /><span>WhatsApp</span><h2>Send the details</h2><p>Include clear photographs or a short video when they help explain the problem.</p><a href="https://wa.me/919894644450">Message support</a></article>
        <article><Wrench /><span>Visit the service team</span><h2>436, Avinashi Road</h2><p>Tiruppur – 641602, Tamil Nadu. Bring the device, charger, invoice, and warranty details where relevant.</p><a href="/contact">Location and map</a></article>
      </section>
    </TenantSiteTemplate>
  );
}
