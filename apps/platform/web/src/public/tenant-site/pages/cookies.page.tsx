import { Cookie, Settings2, ShieldCheck } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantCookiesPage() {
  return (
    <TenantSiteTemplate activePage="cookies" pageTitle="Cookie Policy">
      <TenantPageIntro eyebrow="Cookie policy" title="How the Tech Media storefront uses cookies and similar browser storage." summary="We use essential storage for security and storefront functions. Optional analytics or advertising tools should run only when enabled and, where required, after consent. Last updated: 24 August 2026." />
      <section className="tenant-page-section tenant-principle-grid">
        <article><ShieldCheck /><h3>Essential</h3><p>Security, sessions, cart functions, load balancing, and fraud prevention may require essential cookies.</p></article>
        <article><Settings2 /><h3>Preferences</h3><p>Preference storage can remember display, language, and storefront choices.</p></article>
        <article><Cookie /><h3>Analytics and marketing</h3><p>Optional tools may measure visits or campaign results when they are configured and permitted.</p></article>
      </section>
      <section className="tenant-page-section tenant-prose">
        <article><span>01</span><div><h2>Your control</h2><p>You can remove or block cookies in your browser. Blocking essential cookies can stop the cart, sign-in, or other storefront functions from working.</p></div></article>
        <article><span>02</span><div><h2>Third-party services</h2><p>Embedded maps, payment services, videos, analytics, and social links may use their own cookies when you interact with them. Their privacy policies apply.</p></div></article>
        <article><span>03</span><div><h2>Changes</h2><p>We update this page when the storefront adds or removes cookie-based services. Contact Tech Media at +91 98946 44450 with a question.</p></div></article>
      </section>
    </TenantSiteTemplate>
  );
}
