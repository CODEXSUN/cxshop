import { ArrowRight, Building2, Handshake, History, Wrench } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantPortalCta } from "../blocks/tenant-portal-cta";
import { TenantSectionHeading } from "../blocks/tenant-section-heading";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantAboutPage() {
  return (
    <TenantSiteTemplate activePage="about" pageTitle="About Tech Media">
      <TenantPageIntro
        eyebrow="About Tech Media"
        title="Good technology starts with understanding what you really need."
        summary="Since 2002, people and businesses in Tiruppur have come to Tech Media for straightforward advice, dependable products, careful installation, and support they can reach after the purchase."
        actions={
          <a className="tenant-portal-primary" href="/contact">
            Tell us what you need <ArrowRight />
          </a>
        }
      />
      <section className="tenant-page-section tenant-principle-grid">
        <article>
          <History />
          <h3>Here since 2002</h3>
          <p>More than 25 years of learning from real customers, changing technology, and everyday problems.</p>
        </article>
        <article>
          <Building2 />
          <h3>Built around your work</h3>
          <p>From a student laptop to a factory network, we begin with how the technology will actually be used.</p>
        </article>
        <article>
          <Wrench />
          <h3>Still here after the sale</h3>
          <p>We help with setup, service, troubleshooting, maintenance, and the next upgrade.</p>
        </article>
      </section>
      <section className="tenant-page-section tenant-story-panel">
        <span>How we grew</span>
        <h2>We started with computers. Our customers taught us to solve the bigger picture.</h2>
        <p>
          A computer often needs a reliable network. A growing office needs security, storage,
          communication, and support. Over the years, Tech Media grew from computer retail and
          service into a complete business technology partner—one customer requirement at a time.
        </p>
      </section>
      <section className="tenant-page-section tenant-audience-section">
        <TenantSectionHeading
          eyebrow="What you can expect"
          title="Clear advice. Practical choices. Support you can come back to."
          summary="We look beyond specifications and consider reliability, compatibility, service, cost, and how your needs may change."
        />
        <div className="tenant-audience-grid">
          <article>
            <Handshake />
            <span>Honest guidance</span>
            <h3>A recommendation that fits you</h3>
            <p>We compare suitable brands and options around your requirement and budget.</p>
          </article>
          <article>
            <Wrench />
            <span>Complete support</span>
            <h3>One place to buy, set up, and maintain</h3>
            <p>You know whom to call when something needs attention or the system needs to grow.</p>
          </article>
          <article>
            <Building2 />
            <span>Local experience</span>
            <h3>We understand Tiruppur businesses</h3>
            <p>We work with homes, offices, retailers, schools, textile businesses, and factories.</p>
          </article>
        </div>
      </section>
      <TenantPortalCta
        title="Not sure which product or solution is right?"
        summary="Tell us what you are trying to do. We will help you find a sensible next step without making the conversation complicated."
      />
    </TenantSiteTemplate>
  );
}
