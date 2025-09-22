import "dotenv/config";
import { inArray } from "drizzle-orm";
import { db, pgClient } from "../src/db";
import { tags } from "../src/db/schema";

type TagRecord = { name: string };

const CATEGORY_NAMES = [
  "IT Strategy & Roadmapping",
  "Digital Transformation Consulting",
  "Cloud Architecture & Migration",
  "Cybersecurity Assessment & Compliance",
  "Data Analytics & Business Intelligence",
  "AI & Automation Advisory",
  "Enterprise Software Implementation",
  "Systems Integration Services",
  "DevOps & Infrastructure Automation",
  "Project Management & Delivery",
  "Change Management & Training",
  "IT Support & Helpdesk Services",
  "Managed IT Services",
  "Network Design & Optimization",
  "Modern Workplace Enablement",
  "Security Operations & Monitoring",
  "Business Continuity & Disaster Recovery",
  "Compliance & Governance Consulting",
  "Vendor & Licensing Management",
  "Hardware Lifecycle Management",
  "Recycling & Asset Disposal",
  "Flexible Support Retainers",
];

async function main() {
  try {
    const uniqueCategories = collectUniqueCategories(CATEGORY_NAMES);

    if (uniqueCategories.length === 0) {
      console.log("No categories defined. Nothing to seed.");
      return;
    }

    const existingRows: TagRecord[] =
      uniqueCategories.length === 0
        ? []
        : await db
            .select({ name: tags.name })
            .from(tags)
            .where(inArray(tags.name, uniqueCategories));

    const existingNames = new Set(existingRows.map((row) => row.name.toLowerCase()));

    const tagsToInsert = uniqueCategories
      .filter((name) => !existingNames.has(name.toLowerCase()))
      .map((name) => ({ name }));

    if (tagsToInsert.length === 0) {
      console.log("All categories already exist. No changes made.");
      return;
    }

    await db.insert(tags).values(tagsToInsert);

    console.log(`Seeded ${tagsToInsert.length} tag${tagsToInsert.length === 1 ? "" : "s"}.`);
    console.table(tagsToInsert);
  } finally {
    await pgClient.end({ timeout: 5 }).catch((error) => {
      console.error("Failed to close database connection", error);
    });
  }
}

function collectUniqueCategories(rawNames: string[]): string[] {
  const unique = new Map<string, string>();

  for (const rawName of rawNames) {
    const name = rawName.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, name);
    }
  }

  return [...unique.values()];
}

main().catch((error) => {
  console.error("Failed to seed tags", error);
  process.exit(1);
});
