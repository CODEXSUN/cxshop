import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantTermsPage() {
  return (
    <TenantSiteTemplate activePage="terms" pageTitle="Terms of Use">
      <TenantPageIntro eyebrow="Terms of use" title="Terms for using the Tech Media storefront and placing an order." summary="By using this site or confirming an order, you agree to these terms and the related shipping, return, privacy, and cookie policies. Last updated: 24 August 2026." />
      <section className="tenant-page-section tenant-prose">
        <article><span>01</span><div><h2>Storefront information</h2><p>We work to keep descriptions, images, prices, and availability accurate. A display error does not require us to complete an order at an incorrect price or specification.</p></div></article>
        <article><span>02</span><div><h2>Orders</h2><p>An order request becomes accepted after Tech Media confirms the product, price, stock, payment, and delivery or pickup arrangement. We may cancel and refund an unavailable or incorrectly listed item.</p></div></article>
        <article><span>03</span><div><h2>Payments and invoices</h2><p>You must provide correct billing information and use an authorized payment method. Applicable taxes appear on the invoice. Payment-provider terms may also apply.</p></div></article>
        <article><span>04</span><div><h2>Products and warranty</h2><p>Brand specifications and warranty terms apply to branded products. Compatibility depends on the complete environment. Ask us before purchase if compatibility is essential.</p></div></article>
        <article><span>05</span><div><h2>Acceptable use</h2><p>Do not misuse the site, attempt unauthorized access, interfere with service, copy protected content, submit false orders, or use the storefront for unlawful activity.</p></div></article>
        <article><span>06</span><div><h2>Liability and disputes</h2><p>To the extent permitted by law, Tech Media is not liable for indirect loss or third-party service failure. Consumer rights that cannot be excluded remain unaffected. Indian law applies, subject to the appropriate courts in Tiruppur, Tamil Nadu.</p></div></article>
      </section>
    </TenantSiteTemplate>
  );
}
