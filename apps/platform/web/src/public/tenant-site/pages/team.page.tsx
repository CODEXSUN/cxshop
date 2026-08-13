import { HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";
import { useTenantSite } from "../tenant-site.context";

export function TenantTeamPage() {
  const { portal } = useTenantSite();
  return (
    <TenantSiteTemplate activePage="team" pageTitle="Team">
      <TenantPageIntro
        eyebrow={`People behind ${portal.brandName}`}
        title="A commerce team focused on useful technology and dependable support."
        summary="Product specialists, operations teams, and support partners work together to make business technology easier to choose, buy, and maintain."
      />
      <section className="tenant-page-section tenant-principle-grid">
        <article>
          <UsersRound />
          <h3>Product guidance</h3>
          <p>Clear recommendations shaped around the work a customer needs to complete.</p>
        </article>
        <article>
          <HeartHandshake />
          <h3>Customer support</h3>
          <p>Human help before purchase, during delivery, and after the product is in use.</p>
        </article>
        <article>
          <ShieldCheck />
          <h3>Responsible operations</h3>
          <p>Careful handling of orders, customer information, payments, and service records.</p>
        </article>
      </section>
    </TenantSiteTemplate>
  );
}
