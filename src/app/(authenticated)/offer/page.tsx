import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import { AllOffersView, type OfferGroup } from "./all-offers-view";

export default async function OfferInboxPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const offeredItems = alias(items, "offered_items");

  const offerRows = await db
    .select({
      offerId: offerHistory.id,
      itemId: items.id,
      itemTitle: items.title,
      itemDescription: items.description,
      itemImageUrl: items.imageUrl,
      itemRepeatable: items.repeatable,
      offeredItemId: offerHistory.offeredItemId,
      offeredItemTitle: offeredItems.title,
      offeredItemDescription: offeredItems.description,
      offeredItemImageUrl: offeredItems.imageUrl,
      offeredItemRepeatable: offeredItems.repeatable,
      createdAt: offerHistory.createdAt,
      expiry: offerHistory.expiry,
      acceptedAt: offerHistory.acceptedAt,
      rejectedAt: offerHistory.rejectedAt,
    })
    .from(offerHistory)
    .innerJoin(items, eq(items.id, offerHistory.itemId))
    .leftJoin(offeredItems, eq(offeredItems.id, offerHistory.offeredItemId))
    .where(eq(items.userId, userId))
    .orderBy(desc(offerHistory.createdAt));

  const groupedMap = new Map<number, OfferGroup>();

  for (const row of offerRows) {
    const offerEntry = {
      id: row.offerId,
      createdAt: row.createdAt?.toISOString() ?? null,
      expiry: row.expiry?.toISOString() ?? null,
      acceptedAt: row.acceptedAt?.toISOString() ?? null,
      rejectedAt: row.rejectedAt?.toISOString() ?? null,
      offeredItem: row.offeredItemId
        ? {
            id: row.offeredItemId,
            title: row.offeredItemTitle ?? "Untitled offer",
            description: row.offeredItemDescription ?? "",
            imageUrl: row.offeredItemImageUrl,
            repeatable: row.offeredItemRepeatable ?? false,
          }
        : null,
    } as OfferGroup["offers"][number];

    const existingGroup = groupedMap.get(row.itemId);

    if (existingGroup) {
      existingGroup.offers.push(offerEntry);
      continue;
    }

    groupedMap.set(row.itemId, {
      item: {
        id: row.itemId,
        title: row.itemTitle,
        description: row.itemDescription,
        imageUrl: row.itemImageUrl,
        repeatable: row.itemRepeatable,
      },
      offers: [offerEntry],
    });
  }

  const offerGroups = Array.from(groupedMap.values()).map((group) => ({
    ...group,
    offers: group.offers.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    }),
  }));

  return <AllOffersView groups={offerGroups} />;
}

