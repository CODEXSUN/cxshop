import { sql } from "kysely";
import { getBlogsDatabase } from "../../database/blogs-database.js";

export async function seedArticleModule() {
  const taxonomy = await loadTaxonomy();
  for (const article of articleSeeds) await seedArticle(article, taxonomy);
}

async function loadTaxonomy() {
  const result = await sql<{
    id: number | string;
    slug: string;
  }>`SELECT id,slug FROM blogs_taxonomy WHERE status='active'`.execute(getBlogsDatabase());
  return new Map(result.rows.map((item) => [item.slug, Number(item.id)]));
}

async function seedArticle(article: ArticleSeed, taxonomy: Map<string, number>) {
  const categoryId = taxonomy.get(article.category),
    tagIds = article.tags.map((tag) => taxonomy.get(tag) ?? 0);
  if (!categoryId || tagIds.includes(0))
    throw new Error(`Blog taxonomy is missing for ${article.slug}.`);
  await sql`INSERT INTO blogs_articles(uuid,kind,title,slug,excerpt,mdx,featured_image,image_alt,author_name,author_role,category_id,tag_ids,seo_title,seo_description,canonical_url,status,published_at) VALUES(${article.uuid},'post',${article.title},${article.slug},${article.excerpt},${article.mdx},${article.image},${article.imageAlt},'Editorial Team','Technology Editors',${categoryId},${JSON.stringify(tagIds)},${article.seoTitle},${article.seoDescription},'','published',${article.publishedAt}) ON DUPLICATE KEY UPDATE title=VALUES(title),excerpt=VALUES(excerpt),mdx=VALUES(mdx),featured_image=VALUES(featured_image),image_alt=VALUES(image_alt),author_name=VALUES(author_name),author_role=VALUES(author_role),category_id=VALUES(category_id),tag_ids=VALUES(tag_ids),seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),status='published',published_at=VALUES(published_at)`.execute(
    getBlogsDatabase()
  );
}

type ArticleSeed = {
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  mdx: string;
  image: string;
  imageAlt: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  publishedAt: Date;
};
const articleSeeds: ArticleSeed[] = [
  article(
    "b1090001",
    "How to choose a computer system your business can depend on",
    "choose-business-computer-system",
    "A practical framework for selecting reliable business computers, balancing performance, security, support, and total ownership cost.",
    "buying-guides",
    ["business-computers", "buying-guide"],
    "system",
    "Choose a Reliable Business Computer System",
    "Choose dependable business computers using workload, security, support, warranty, and total-cost criteria.",
    `# Choose for the work, not the specification sheet

A dependable business computer fits the workload, remains supportable, protects information, and can be replaced without disrupting the team.

## Map the real workload

- List daily applications, browser tabs, reports, video calls, and specialist tools.
- Measure the largest files and the busiest part of the working day.
- Separate general office roles from development, design, engineering, and media work.
- Record mobility, battery, display, port, and accessibility requirements.

## Balance the specification

Prioritise a current processor, enough memory for real multitasking, solid-state storage, a quality power supply, and a useful warranty. Buy extra performance only where the workload benefits.

## Protect continuity

Use supported operating systems, encryption, multi-factor authentication, managed updates, tested backups, and documented recovery. Standardise a small set of approved configurations so onboarding, spares, and support stay manageable.

## Calculate the full cost

Include warranty coverage, expected repair time, compatible accessories, energy use, software licensing, support effort, and replacement cycle. The cheapest device is rarely the lowest-cost system when downtime is included.`
  ),
  article(
    "b1090002",
    "Laptop buying guide: performance, battery, display, and ports",
    "business-laptop-buying-guide",
    "Understand the laptop choices that matter for office work, travel, meetings, development, and creative workloads.",
    "laptops",
    ["remote-work", "buying-guide", "performance"],
    "laptop",
    "Business Laptop Buying Guide",
    "Compare processors, memory, battery, display quality, ports, repairability, and warranties before buying business laptops.",
    `# A laptop is a complete working environment

The right laptop must perform well away from a desk while connecting cleanly when the user returns to one.

## Processor and memory

Choose the processor tier for sustained workload, not brief benchmark peaks. General office users usually benefit more from sufficient memory and fast storage than from the highest processor model. Developers, analysts, designers, and video teams need additional headroom.

## Battery and charging

Compare tested battery life, USB-C charging support, charger availability, battery health tools, and replacement options. A common charger standard reduces travel and support friction.

## Display and ergonomics

Check brightness, resolution, colour accuracy, text clarity, webcam placement, keyboard comfort, trackpad quality, weight, and hinge stability. Small differences become important across a full working day.

## Ports, docks, and wireless

Confirm monitor outputs, USB capacity, Ethernet needs, Wi-Fi generation, Bluetooth, smart-card or security-key support, and dock compatibility before standardising a model.

## Serviceability

Review warranty response, accidental-damage options, memory and storage access, battery replacement, spare chargers, and the time required to restore a replacement device.`
  ),
  article(
    "b1090003",
    "Desktop or workstation: match the system to the workload",
    "desktop-vs-workstation-guide",
    "A role-based guide to office desktops, compact PCs, professional workstations, monitors, and upgrade paths.",
    "desktop-systems",
    ["business-computers", "performance", "buying-guide"],
    "desktop",
    "Desktop vs Workstation Guide",
    "Choose between an office desktop, compact PC, or workstation using workload, graphics, memory, expansion, and reliability needs.",
    `# Start with the role

Office desktops, compact PCs, and professional workstations solve different problems. Define the applications, data size, graphics needs, and operating hours before choosing the form factor.

## Office desktops

Prioritise quiet operation, efficient processors, 16 GB or more memory where multitasking requires it, fast SSD storage, dual-display support, and dependable onsite warranty coverage.

## Compact PCs

Compact systems save space and energy. Confirm cooling, port access, VESA mounting, memory and storage replacement, and external power-adapter availability.

## Professional workstations

Engineering, 3D, scientific, AI, and advanced media workloads can require certified drivers, error-correcting memory, professional graphics, larger power supplies, and sustained cooling.

## Monitor planning

Match size, resolution, panel quality, scaling, ergonomics, and connection standards to the task. Two consistent monitors can improve productivity more than an unnecessarily expensive processor.

## Expansion and lifecycle

Document spare memory slots, storage bays, graphics clearance, power capacity, and warranty conditions before planning upgrades.`
  ),
  article(
    "b1090004",
    "RAM, SSD, processor, or graphics: which upgrade helps most?",
    "computer-upgrade-priority-guide",
    "Diagnose the bottleneck before spending on memory, storage, processors, or graphics hardware.",
    "components-upgrades",
    ["performance", "maintenance"],
    "upgrade",
    "Computer Upgrade Priority Guide",
    "Learn whether RAM, SSD storage, processor, or graphics upgrades will improve your computer workload most.",
    `# Upgrade the bottleneck

An upgrade is valuable only when it removes the constraint affecting real work. Measure symptoms before ordering components.

## Add memory when

Applications reload frequently, browser tabs are discarded, large spreadsheets pause, or the system uses storage heavily while memory remains full. Check supported capacity, module type, speed, channel layout, and warranty rules.

## Upgrade storage when

The system still uses a hard drive, free space is consistently low, large files transfer slowly, or application startup is storage-bound. Choose a reputable SSD with suitable endurance and maintain verified backups before migration.

## Consider processor replacement when

Sustained compute work remains near full utilisation and the platform supports a worthwhile upgrade. In many business systems, a platform replacement is safer than changing an old processor.

## Upgrade graphics when

3D, rendering, video, GPU compute, or multiple high-resolution displays exceed current capability. Confirm software support, power supply, cooling, physical clearance, and driver requirements.

## Verify the result

Record baseline timings, complete the change safely, update firmware where appropriate, run health checks, and compare the same workload afterwards.`
  ),
  article(
    "b1090005",
    "A practical small-business network and security checklist",
    "small-business-network-security-checklist",
    "Build reliable Wi-Fi, protected accounts, segmented devices, resilient backups, and a tested incident response plan.",
    "networking-security",
    ["security", "business-computers"],
    "network",
    "Small Business Network Security Checklist",
    "Improve small-business network security with reliable Wi-Fi, segmentation, MFA, updates, backups, monitoring, and recovery tests.",
    `# Reliability and security belong together

A secure network that frequently fails will be bypassed. A fast network without access control and recovery planning creates business risk.

## Internet and Wi-Fi

Use business-appropriate routers and access points, place them using measured coverage, separate administration credentials, update firmware, and document provider escalation details.

## Segment important devices

Keep staff computers, servers, guest devices, cameras, and unmanaged equipment in appropriate network segments. Allow only the communication each group requires.

## Protect identity

Require unique accounts, password managers, multi-factor authentication, prompt offboarding, least privilege, and separate administrator identities.

## Maintain endpoints

Use supported operating systems, automatic security updates, device encryption, endpoint protection, screen locks, and managed browser policies.

## Back up and recover

Maintain offline or isolated copies, monitor backup failures, document recovery ownership, and restore sample files regularly. A backup is only useful after a successful restore test.

## Prepare for incidents

Record who isolates devices, contacts providers, preserves evidence, communicates with customers, and approves recovery actions.`
  ),
  article(
    "b1090006",
    "Preventive computer maintenance for fewer failures and longer life",
    "preventive-computer-maintenance-guide",
    "A repeatable monthly, quarterly, and annual maintenance plan for business computers and accessories.",
    "maintenance-support",
    ["maintenance", "business-computers"],
    "maintenance",
    "Preventive Computer Maintenance Guide",
    "Use monthly, quarterly, and annual computer maintenance to reduce failures, protect data, and extend useful device life.",
    `# Maintenance should be scheduled and visible

Small recurring checks prevent storage exhaustion, overheating, failed backups, expired warranties, and unsupported software from becoming urgent disruptions.

## Monthly checks

- Confirm operating-system and application updates completed.
- Review storage capacity, device health alerts, antivirus status, and backup results.
- Clean screens, keyboards, vents, and accessible filters using suitable methods.
- Record repeated crashes, battery warnings, unusual noise, or performance changes.

## Quarterly checks

Review startup applications, firmware advisories, warranty status, spare-device readiness, account access, recovery documentation, and restore tests. Inspect cables, chargers, docks, surge protection, and network equipment.

## Annual planning

Group devices by age, warranty, workload suitability, repair history, operating-system support, and expected replacement date. Budget replacements before support expires.

## Avoid risky shortcuts

Do not open equipment that must remain warranty-sealed, use household vacuums on sensitive electronics, install unverified driver tools, or postpone failing-drive replacement after health warnings.

## Keep a useful record

For each device, retain model, serial number, assigned user, purchase date, warranty, configuration, repairs, encrypted recovery details, and disposal outcome.`
  )
];

function article(
  uuid: string,
  title: string,
  slug: string,
  excerpt: string,
  category: string,
  tags: string[],
  imageName: string,
  seoTitle: string,
  seoDescription: string,
  mdx: string
): ArticleSeed {
  const index = Number(uuid.slice(-1));
  return {
    uuid,
    title,
    slug,
    excerpt,
    category,
    tags,
    mdx,
    image: `/blog/${imageName}.svg`,
    imageAlt: `Editorial illustration for ${title}`,
    seoTitle,
    seoDescription,
    publishedAt: new Date(Date.UTC(2026, 6, index + 10, 8, 30))
  };
}
