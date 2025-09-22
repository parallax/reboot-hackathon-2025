import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { desc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import { AllOffersView, type OfferGroup } from "./all-offers-view";

export default async function OffersPage() {
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
      itemOwnerId: items.userId,
      offeredItemId: offerHistory.offeredItemId,
      offeredItemTitle: offeredItems.title,
      offeredItemDescription: offeredItems.description,
      offeredItemImageUrl: offeredItems.imageUrl,
      offeredItemRepeatable: offeredItems.repeatable,
      offeredItemOwnerId: offeredItems.userId,
      createdAt: offerHistory.createdAt,
      expiry: offerHistory.expiry,
      acceptedAt: offerHistory.acceptedAt,
      rejectedAt: offerHistory.rejectedAt,
      rejectReason: offerHistory.rejectReason,
    })
    .from(offerHistory)
    .innerJoin(items, eq(items.id, offerHistory.itemId))
    .leftJoin(offeredItems, eq(offeredItems.id, offerHistory.offeredItemId))
    .where(or(eq(items.userId, userId), eq(offeredItems.userId, userId)))
    .orderBy(desc(offerHistory.createdAt));

  const receivedMap = new Map<number, OfferGroup>();
  const sentMap = new Map<number, OfferGroup>();

  const buildOfferEntry = (row: (typeof offerRows)[number]): OfferGroup["offers"][number] => ({
    id: row.offerId,
    createdAt: row.createdAt ?? null,
    expiry: row.expiry ?? null,
    acceptedAt: row.acceptedAt ?? null,
    rejectedAt: row.rejectedAt ?? null,
    offeredItem: row.offeredItemId
      ? {
          id: row.offeredItemId,
          title: row.offeredItemTitle ?? "Untitled offer",
          description: row.offeredItemDescription ?? "",
          imageUrl: row.offeredItemImageUrl,
          repeatable: row.offeredItemRepeatable ?? false,
        }
      : null,
    rejectionReason: row.rejectReason ?? null,
  });

  for (const row of offerRows) {
    if (row.itemOwnerId === userId) {
      const existingGroup = receivedMap.get(row.itemId);

      if (existingGroup) {
        existingGroup.offers.push(buildOfferEntry(row));
      } else {
        receivedMap.set(row.itemId, {
          item: {
            id: row.itemId,
            title: row.itemTitle,
            description: row.itemDescription,
            imageUrl: row.itemImageUrl,
            repeatable: row.itemRepeatable,
          },
          offers: [buildOfferEntry(row)],
        });
      }
    }

    if (row.offeredItemOwnerId === userId) {
      const existingGroup = sentMap.get(row.itemId);

      if (existingGroup) {
        existingGroup.offers.push(buildOfferEntry(row));
      } else {
        sentMap.set(row.itemId, {
          item: {
            id: row.itemId,
            title: row.itemTitle,
            description: row.itemDescription,
            imageUrl: row.itemImageUrl,
            repeatable: row.itemRepeatable,
          },
          offers: [buildOfferEntry(row)],
        });
      }
    }
  }

  const sortGroupOffers = (group: OfferGroup) => ({
    ...group,
    offers: group.offers.sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    }),
  });

  const sortGroups = (groups: OfferGroup[]) =>
    groups
      .map(sortGroupOffers)
      .sort((a, b) => {
        const latestA = a.offers[0]?.createdAt?.getTime() ?? 0;
        const latestB = b.offers[0]?.createdAt?.getTime() ?? 0;
        return latestB - latestA;
      });

  const received = sortGroups(Array.from(receivedMap.values()));
  const sent = sortGroups(Array.from(sentMap.values()));

  return <AllOffersView received={received} sent={sent} />;
}
