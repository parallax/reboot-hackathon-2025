import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { desc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { createClerkClient } from "@clerk/backend";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import {
  AllOffersView,
  type OfferGroup,
  type ItemSummary,
} from "./all-offers-view";

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
    })
    .from(offerHistory)
    .innerJoin(items, eq(items.id, offerHistory.itemId))
    .leftJoin(offeredItems, eq(offeredItems.id, offerHistory.offeredItemId))
    .where(or(eq(items.userId, userId), eq(offeredItems.userId, userId)))
    .orderBy(desc(offerHistory.createdAt));

  // Get unique user IDs to fetch usernames
  const uniqueUserIds = new Set<string>();
  offerRows.forEach((row) => {
    if (row.itemOwnerId) uniqueUserIds.add(row.itemOwnerId);
    if (row.offeredItemOwnerId) uniqueUserIds.add(row.offeredItemOwnerId);
  });

  // Fetch usernames from Clerk
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  const userNames = new Map<string, string>();
  for (const uid of uniqueUserIds) {
    try {
      const user = await clerkClient.users.getUser(uid);
      userNames.set(uid, user.firstName ?? `User ${uid.slice(0, 8)}...`);
    } catch (error) {
      console.error("Error fetching user from Clerk:", error);
      userNames.set(uid, `User ${uid.slice(0, 8)}...`);
    }
  }

  // Build offer entries with usernames
  const buildOfferEntry = (
    row: (typeof offerRows)[number]
  ): OfferGroup["offers"][number] => ({
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
    offererName: row.offeredItemOwnerId ? userNames.get(row.offeredItemOwnerId) : undefined,
    targetUserName: row.itemOwnerId ? userNames.get(row.itemOwnerId) : undefined,
  });

  const receivedMap = new Map<number, OfferGroup>();
  const sentMap = new Map<number, OfferGroup>();

  for (const row of offerRows) {
    const offerEntry = buildOfferEntry(row);

    if (row.itemOwnerId === userId) {
      // This is a received offer (someone offered on my item)
      if (!receivedMap.has(row.itemId)) {
        receivedMap.set(row.itemId, {
          item: {
            id: row.itemId,
            title: row.itemTitle,
            description: row.itemDescription,
            imageUrl: row.itemImageUrl,
            repeatable: row.itemRepeatable,
          },
          offers: [],
        });
      }
      receivedMap.get(row.itemId)!.offers.push(offerEntry);
    } else if (row.offeredItemOwnerId === userId) {
      // This is a sent offer (I offered on someone else's item)
      if (!sentMap.has(row.itemId)) {
        sentMap.set(row.itemId, {
          item: {
            id: row.itemId,
            title: row.itemTitle,
            description: row.itemDescription,
            imageUrl: row.itemImageUrl,
            repeatable: row.itemRepeatable,
          },
          offers: [],
        });
      }
      sentMap.get(row.itemId)!.offers.push(offerEntry);
    }
  }

  const sortGroupOffers = (group: OfferGroup) => ({
    ...group,
    offers: group.offers.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    }),
  });

  const sortGroups = (groups: OfferGroup[]) =>
    groups.map(sortGroupOffers).sort((a, b) => {
      const latestA = a.offers[0]?.createdAt
        ? new Date(a.offers[0].createdAt).getTime()
        : 0;
      const latestB = b.offers[0]?.createdAt
        ? new Date(b.offers[0].createdAt).getTime()
        : 0;
      return latestB - latestA;
    });

  const received = sortGroups(Array.from(receivedMap.values()));
  const sent = sortGroups(Array.from(sentMap.values()));

  // Get all user items to show in "My Listings" section
  const allUserItems = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      imageUrl: items.imageUrl,
      repeatable: items.repeatable,
    })
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.id));

  return (
    <AllOffersView
      received={received}
      sent={sent}
      allUserItems={allUserItems}
    />
  );
}