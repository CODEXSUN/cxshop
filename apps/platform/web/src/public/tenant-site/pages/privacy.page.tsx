import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantPrivacyPage() {
  return (
    <TenantSiteTemplate activePage="privacy" pageTitle="Privacy Policy">
      <TenantPageIntro eyebrow="Privacy policy" title="How Tech Media handles information from storefront visitors and customers." summary="This policy explains the information we collect, why we use it, when we share it, and the choices available to you. Last updated: 24 August 2026." />
      <section className="tenant-page-section tenant-prose">
        <article><span>01</span><div><h2>Information we collect</h2><p>We may collect your name, phone number, email, address, order details, payment status, support messages, device information, and service records. Payment providers process sensitive payment credentials under their own policies.</p></div></article>
        <article><span>02</span><div><h2>How we use information</h2><p>We use information to answer enquiries, process orders, deliver products, provide service, prevent fraud, meet tax and legal duties, improve the storefront, and send requested updates.</p></div></article>
        <article><span>03</span><div><h2>Sharing</h2><p>We share only the information needed with delivery carriers, payment providers, manufacturers, warranty partners, hosting providers, and authorities when the law requires it. We do not sell personal information.</p></div></article>
        <article><span>04</span><div><h2>Retention and security</h2><p>We keep information for the period needed for orders, warranty, accounting, legal duties, and dispute handling. We use access controls and reasonable technical safeguards, but no online system is risk-free.</p></div></article>
        <article><span>05</span><div><h2>Your choices</h2><p>You may ask to access, correct, or delete eligible personal information. Some records must remain for tax, warranty, fraud prevention, or legal reasons.</p></div></article>
        <article><span>06</span><div><h2>Contact</h2><p>Contact Tech Media at 436, Avinashi Road, Tiruppur – 641602, Tamil Nadu, or call +91 98946 44450 for a privacy request.</p></div></article>
      </section>
    </TenantSiteTemplate>
  );
}
