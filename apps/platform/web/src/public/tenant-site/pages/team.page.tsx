import { HeartHandshake, SearchCheck, Wrench } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantPortalCta } from "../blocks/tenant-portal-cta";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantTeamPage() {
  return (
    <TenantSiteTemplate activePage="team" pageTitle="Tech Media Team">
      <TenantPageIntro eyebrow="People behind Tech Media" title="A local team you can speak to before and after the purchase." summary="Our product, service, and business technology teams work together to understand the requirement, recommend a practical option, and support it in use." />
      <section className="tenant-page-section tenant-principle-grid">
        <article><SearchCheck /><h3>Product guidance</h3><p>We compare the workload, budget, compatibility, service needs, and upgrade path.</p></article>
        <article><Wrench /><h3>Technical service</h3><p>Our team supports setup, diagnosis, repair, upgrades, networking, and maintenance.</p></article>
        <article><HeartHandshake /><h3>Business support</h3><p>We coordinate orders, installations, warranty assistance, and ongoing technology needs.</p></article>
      </section>
      <TenantPortalCta title="Need help from the right person?" summary="Tell us whether you need a product, service, order update, or business solution. We will direct your request." />
    </TenantSiteTemplate>
  );
}
