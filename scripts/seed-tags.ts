import "dotenv/config";
import { inArray } from "drizzle-orm";
import { db, pgClient } from "../src/db";
import { tags } from "../src/db/schema";

type TagRecord = { name: string };

const CATEGORY_NAMES = [
  "Business & Tech Expertise",
  "Coaching & Mentoring",
  "Community & Volunteering",
  "Creative & Design Skills",
  "Event & Meeting Venues",
  "Events & Hospitality Services",
  "Finance & Legal Support",
  "Food & Drink",
  "Furniture & Fixtures",
  "Gardening & Outdoor Gear",
  "Hands-On Trades & Repairs",
  "IT & Electronics",
  "Learning & Training",
  "Marketing & Content",
  "Media & Promotion Opportunities",
  "Office & Co-Working Space",
  "Specialist Equipment",
  "Stock & Materials",
  "Vehicles & Transport",
  "Other",
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
