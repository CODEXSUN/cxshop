import { Cookie, Settings2, ShieldCheck } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";
import { useTenantSite } from "../tenant-site.context";

export function TenantCookiesPage() {
  const { portal } = useTenantSite();
  return (
    <TenantSiteTemplate activePage="cookies" pageTitle="Cookie policy">
      <TenantPageIntro
        eyebrow="Cookie policy"
        title="Small files used for secure sessions and a reliable storefront."
        summary={`${portal.brandName} uses essential cookies for authentication, security, preferences, and service continuity. Optional analytics should only run when consent is available.`}
      />
      <section className="tenant-page-section tenant-principle-grid">
        <article>
          <ShieldCheck />
          <h3>Essential cookies</h3>
          <p>
            Protect sessions, prevent abuse, and preserve the actions required to operate the
            service.
          </p>
        </article>
        <article>
          <Settings2 />
          <h3>Preference cookies</h3>
          <p>Remember choices such as display preferences when the browser permits them.</p>
        </article>
        <article>
          <Cookie />
          <h3>Your control</h3>
          <p>
            Browser settings can remove or block cookies, although essential application features
            may stop working.
          </p>
        </article>
      </section>
    </TenantSiteTemplate>
  );
}
