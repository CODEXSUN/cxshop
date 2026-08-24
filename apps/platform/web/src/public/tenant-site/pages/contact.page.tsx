import { ArrowRight, MapPin, MessageSquareText, Phone, Wrench } from "lucide-react";
import { TenantFaq, type TenantFaqItem } from "../blocks/tenant-faq";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

const contactFaq: TenantFaqItem[] = [
  { question: "Can you help us choose computers or laptops?", answer: "Yes. Share the workload, applications, budget, service expectations, and upgrade needs. We can recommend suitable options for home, study, professional, or business use." },
  { question: "Do you handle networking and business IT installations?", answer: "Yes. Tech Media supports networking, Wi-Fi, servers, storage, CCTV, biometric attendance, access control, POS, VoIP, displays, and related infrastructure." },
  { question: "Can we contact Tech Media for service and upgrades?", answer: "Yes. Contact the team about desktop and laptop service, hardware upgrades, networking support, maintenance, and warranty assistance." }
];

export function TenantContactPage() {
  return (
    <TenantSiteTemplate activePage="contact" pageTitle="Contact Tech Media">
      <TenantPageIntro eyebrow="Contact Tech Media" title="Visit, call, or discuss your technology requirement." summary="Talk to our Tiruppur team about computers, laptops, service, networking, business IT infrastructure, security, and technology upgrades." />
      <section className="tenant-page-section tenant-contact-grid">
        <article><MapPin /><span>Visit the store</span><h2>436, Avinashi Road</h2><p>Tiruppur – 641602, Tamil Nadu, India</p><a href="https://www.google.com/maps/search/?api=1&query=Tech+Media+436+Avinashi+Road+Tiruppur+641602" target="_blank" rel="noreferrer">Open Google Maps <ArrowRight /></a></article>
        <article><Phone /><span>Call Tech Media</span><h2>+91 98946 44450</h2><p>Product enquiries, service support, and business technology discussions.</p><a href="tel:+919894644450">Call now <ArrowRight /></a></article>
        <article><MessageSquareText /><span>Plan a solution</span><h2>Tell us what the work requires</h2><p>Share the users, location, workload, current setup, expected outcome, and future plans.</p><a href="https://wa.me/919894644450">Message on WhatsApp <ArrowRight /></a></article>
      </section>
      <section className="tenant-page-section tenant-location-section">
        <div className="tenant-location-copy">
          <span>Find us in Tiruppur</span>
          <h2>Tech Media, Avinashi Road</h2>
          <p>436, Avinashi Road, Tiruppur – 641602, Tamil Nadu, India</p>
          <a
            className="tenant-portal-primary"
            href="https://www.google.com/maps/search/?api=1&query=Tech+Media+436+Avinashi+Road+Tiruppur+641602"
            target="_blank"
            rel="noreferrer"
          >
            Get directions <ArrowRight />
          </a>
        </div>
        <div className="tenant-location-map">
          <iframe
            title="Tech Media, Tiruppur on Google Maps"
            src="https://www.google.com/maps?q=Tech+Media%2C%20436%20Avinashi%20Road%2C%20Tiruppur%20641602&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
      <section className="tenant-page-section tenant-story-panel"><Wrench /><span>Service and support</span><h2>Computers, laptops, upgrades, networking, and business technology.</h2><p>Bring the device or describe the site requirement. We will help identify a practical next step.</p></section>
      <TenantFaq items={contactFaq} title="Product, installation, and service questions" />
    </TenantSiteTemplate>
  );
}
