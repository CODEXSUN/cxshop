import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";

export async function seedTaxonomyModule() {
  for (const item of taxonomySeeds) await seed(item);
}

async function seed(item: TaxonomySeed) {
  await sql`INSERT INTO blogs_taxonomy(uuid,kind,name,slug,description,status) VALUES(${item.uuid},${item.kind},${item.name},${item.slug},${item.description},'active') ON DUPLICATE KEY UPDATE kind=VALUES(kind),name=VALUES(name),slug=VALUES(slug),description=VALUES(description),status='active'`.execute(
    getBlogsDatabase()
  );
}

type TaxonomySeed = {
  uuid: string;
  kind: "category" | "tag";
  name: string;
  slug: string;
  description: string;
};
const taxonomySeeds: TaxonomySeed[] = [
  {
    uuid: "a11ce001",
    kind: "category",
    name: "Buying Guides",
    slug: "buying-guides",
    description: "Practical frameworks for choosing computers and technology."
  },
  {
    uuid: "a11ce002",
    kind: "category",
    name: "Laptops",
    slug: "laptops",
    description: "Mobile performance, battery, displays, docks, and business laptops."
  },
  {
    uuid: "a11ce003",
    kind: "category",
    name: "Desktop Systems",
    slug: "desktop-systems",
    description: "Office desktops, workstations, monitors, and workspace planning."
  },
  {
    uuid: "a11ce004",
    kind: "category",
    name: "Components & Upgrades",
    slug: "components-upgrades",
    description: "Memory, storage, graphics, processors, and useful upgrade decisions."
  },
  {
    uuid: "a11ce005",
    kind: "category",
    name: "Networking & Security",
    slug: "networking-security",
    description: "Reliable networks, device security, backups, and business continuity."
  },
  {
    uuid: "a11ce006",
    kind: "category",
    name: "Maintenance & Support",
    slug: "maintenance-support",
    description: "Preventive care, troubleshooting, warranties, and lifecycle planning."
  },
  {
    uuid: "a11ce011",
    kind: "tag",
    name: "Business Computers",
    slug: "business-computers",
    description: "Computer guidance for teams and organisations."
  },
  {
    uuid: "a11ce012",
    kind: "tag",
    name: "Performance",
    slug: "performance",
    description: "Balanced hardware performance and workload planning."
  },
  {
    uuid: "a11ce013",
    kind: "tag",
    name: "Security",
    slug: "security",
    description: "Device, account, data, and network protection."
  },
  {
    uuid: "a11ce014",
    kind: "tag",
    name: "Buying Guide",
    slug: "buying-guide",
    description: "Clear technology purchase guidance."
  },
  {
    uuid: "a11ce015",
    kind: "tag",
    name: "Maintenance",
    slug: "maintenance",
    description: "Reliable operation and preventive care."
  },
  {
    uuid: "a11ce016",
    kind: "tag",
    name: "Remote Work",
    slug: "remote-work",
    description: "Mobile and hybrid work technology."
  }
];
