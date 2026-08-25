import { ArrowRight } from "lucide-react";
import { TenantPageIntro } from "../blocks/tenant-page-intro";
import { TenantSiteTemplate } from "../templates/tenant-site.template";

export function TenantAboutPage() {
  return (
    <TenantSiteTemplate activePage="about" pageTitle="About Tech Media">
      <TenantPageIntro
        eyebrow="About Tech Media"
        title="Technology that works for your business."
        summary="Tech Media provides computer hardware, IT infrastructure, networking, business technology, and automation solutions for businesses, institutions, and professionals."
      />
      <article className="tenant-about-article">
        <header>
          <span>More than 25 years of technology experience</span>
          <p>
            Choosing technology is not simply about buying a product. It is about selecting the
            right solution, ensuring reliable installation, providing dependable service, and
            creating a technology environment that can grow with your business.
          </p>
          <p>
            From a single computer or laptop to a complete business IT infrastructure, Tech Media
            helps customers choose, implement, maintain, and upgrade technology with confidence.
          </p>
        </header>
        <section>
          <h2>25+ years of technology experience</h2>
          <p>
            Technology keeps changing, but our approach remains simple: understand the requirement,
            recommend the right technology, implement it properly, and support it reliably.
          </p>
          <p>
            Our experience across computer hardware, networking, business IT, and technology
            solutions allows us to look beyond individual products and understand the complete
            requirement. We work with small and medium businesses, textile and garment industries,
            manufacturing companies, corporate offices, educational institutions, retail businesses,
            and commercial establishments.
          </p>
        </section>
        <section aria-labelledby="technology-solutions">
          <h2 id="technology-solutions">Our technology solutions</h2>
          <p>
            Tech Media provides a wide range of technology products and business solutions,
            including:
          </p>
          <ul className="tenant-about-solutions">
            <li>Computer and laptop sales</li>
            <li>Computer hardware and accessories</li>
            <li>Laptop and desktop service</li>
            <li>Networking solutions</li>
            <li>Wi-Fi and campus networking</li>
            <li>Server and storage solutions</li>
            <li>CCTV and security solutions</li>
            <li>Biometric and attendance systems</li>
            <li>Face recognition and access control</li>
            <li>POS and barcode solutions</li>
            <li>Business printers and scanning solutions</li>
            <li>VoIP and business communication</li>
            <li>Video conferencing solutions</li>
            <li>Commercial displays and digital signage</li>
            <li>IT infrastructure setup</li>
            <li>Annual Maintenance Contracts (AMC)</li>
            <li>Business automation and technology integration</li>
          </ul>
          <p>
            Our objective is to make technology practical, reliable, serviceable, and scalable for
            every customer.
          </p>
        </section>
        <section>
          <h2>Technology for business, not just products</h2>
          <p>
            A computer, printer, network, or software system is only one part of a business technology
            environment. The real value comes when different technologies work together.
          </p>
          <p>
            That is why Tech Media focuses on understanding the complete workflow of a business before
            recommending a solution. We consider performance, reliability, compatibility,
            serviceability, upgradeability, operating cost, and future requirements. Whether you are
            setting up a new office, upgrading existing IT infrastructure, improving network
            performance, or implementing technology for a manufacturing environment, our team can
            help identify the right approach.
          </p>
        </section>
        <section>
          <h2>Serving Tirupur and beyond</h2>
          <p>
            Based in Tirupur, Tamil Nadu, Tech Media serves businesses and customers looking for
            dependable computer, laptop, networking, and IT solutions in Tirupur and surrounding
            areas.
          </p>
          <p>
            Tirupur is one of India&apos;s major textile and garment manufacturing hubs. Our experience
            in this environment has helped us understand the technology requirements of manufacturing
            units, offices, warehouses, retail operations, and production environments. We also
            support customers across different business sectors with technology products,
            installation, service, and ongoing support.
          </p>
        </section>
        <section>
          <h2>Our approach</h2>
          <p>
            The best technology solution is not necessarily the most expensive one. It is the solution
            that delivers the right balance of performance, reliability, serviceability, and value.
          </p>
          <p className="tenant-about-principles">
            <strong>Understand</strong>
            <span aria-hidden="true">→</span>
            <strong>Recommend</strong>
            <span aria-hidden="true">→</span>
            <strong>Implement</strong>
            <span aria-hidden="true">→</span>
            <strong>Support</strong>
            <span aria-hidden="true">→</span>
            <strong>Upgrade</strong>
          </p>
          <p>
            This approach helps customers make technology decisions with greater confidence and
            reduces the long-term challenges that can come from choosing products without considering
            the complete ecosystem.
          </p>
        </section>
        <section>
          <h2>Why choose Tech Media?</h2>
          <div className="tenant-about-reasons">
            <div>
              <h3>Experience you can trust</h3>
              <p>
                More than 25 years of practical knowledge across technology products, business
                requirements, and real-world implementation.
              </p>
            </div>
            <div>
              <h3>Multi-brand technology expertise</h3>
              <p>
                We work across brands and product categories, so recommendations are based on the
                requirement rather than a single product ecosystem.
              </p>
            </div>
            <div>
              <h3>Complete technology support</h3>
              <p>
                From selection and installation to troubleshooting, maintenance, and upgrades, we
                support the complete technology lifecycle.
              </p>
            </div>
            <div>
              <h3>Business-focused solutions</h3>
              <p>
                We focus on how technology will be used in the business, not only on product
                specifications.
              </p>
            </div>
            <div>
              <h3>Long-term partnership</h3>
              <p>
                Our goal is to build lasting relationships through dependable products, practical
                solutions, and responsive service.
              </p>
            </div>
          </div>
        </section>
        <section className="tenant-about-purpose">
          <div>
            <h2>Our vision</h2>
            <p>
              To become a trusted technology partner for businesses by making IT, networking,
              automation, and digital infrastructure simpler, more reliable, and easier to manage.
            </p>
          </div>
          <div>
            <h2>Our mission</h2>
            <p>
              To help businesses adopt the right technology through practical advice, quality
              products, professional implementation, and dependable after-sales support.
            </p>
          </div>
        </section>
        <footer>
          <p>
            Whether you are looking for a laptop in Tirupur, computer hardware, business networking,
            Wi-Fi solutions, CCTV, biometric attendance, POS systems, IT infrastructure, or complete
            technology solutions, Tech Media is ready to help. We do not just sell technology. We
            help you choose the technology that works for you.
          </p>
          <strong>Computer Hardware | IT Solutions | Networking | Business Technology</strong>
          <small>Serving businesses in Tirupur and across Tamil Nadu.</small>
          <a href="/contact">
            Contact Tech Media <ArrowRight aria-hidden="true" />
          </a>
        </footer>
      </article>
    </TenantSiteTemplate>
  );
}
