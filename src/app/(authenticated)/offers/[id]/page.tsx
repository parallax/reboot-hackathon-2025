import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import {
  OfferDetailView,
  type OfferDetailViewProps,
} from "./offer-detail-view";

type OffersPageProps = {
  params: Promise<{ id: string | number }> | { id: string | number };
};

export default async function Page({ params }: OffersPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  let itemId = Number(id);

  if (!Number.isFinite(itemId)) {
    notFound();
  }

  const offeredItems = alias(items, "offered_items");

  const listingResult = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      imageUrl: items.imageUrl,
      repeatable: items.repeatable,
      userId: items.userId,
    })
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);

  let listing = listingResult.at(0);

  if (!listing) {
    const offerLookup = await db
      .select({ itemId: offerHistory.itemId })
      .from(offerHistory)
      .where(eq(offerHistory.id, itemId))
      .limit(1);

    const offerMatch = offerLookup.at(0);

    if (!offerMatch) {
      notFound();
    }

    itemId = offerMatch.itemId;

    const fallbackListing = await db
      .select({
        id: items.id,
        title: items.title,
        description: items.description,
        imageUrl: items.imageUrl,
        repeatable: items.repeatable,
        userId: items.userId,
      })
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    listing = fallbackListing.at(0);

    if (!listing) {
      notFound();
    }
  }

  const offerRows = await db
    .select({
      id: offerHistory.id,
      itemId: offerHistory.itemId,
      offeredItemId: offerHistory.offeredItemId,
      expiry: offerHistory.expiry,
      createdAt: offerHistory.createdAt,
      acceptedAt: offerHistory.acceptedAt,
      rejectedAt: offerHistory.rejectedAt,
      offeredTitle: offeredItems.title,
      offeredDescription: offeredItems.description,
      offeredImageUrl: offeredItems.imageUrl,
      offeredRepeatable: offeredItems.repeatable,
      offeredOwnerId: offeredItems.userId,
      rejectReason: offerHistory.rejectReason,
    })
    .from(offerHistory)
    .leftJoin(offeredItems, eq(offeredItems.id, offerHistory.offeredItemId))
    .where(eq(offerHistory.itemId, itemId))
    .orderBy(desc(offerHistory.createdAt));

  const isListingOwner = listing.userId === userId;
  const offersVisibleToUser = isListingOwner
    ? offerRows
    : offerRows.filter((offer) => offer.offeredOwnerId === userId);

  if (!isListingOwner && offersVisibleToUser.length === 0) {
    notFound();
  }

  const payload: OfferDetailViewProps = {
    item: {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageUrl: listing.imageUrl,
      repeatable: listing.repeatable,
    },
    offers: offersVisibleToUser.map((offer) => ({
      id: offer.id,
      createdAt: offer.createdAt?.toISOString() ?? null,
      expiry: offer.expiry?.toISOString() ?? null,
      acceptedAt: offer.acceptedAt?.toISOString() ?? null,
      rejectedAt: offer.rejectedAt?.toISOString() ?? null,
      offeredItem: offer.offeredItemId
        ? {
            id: offer.offeredItemId,
            title: offer.offeredTitle ?? "Untitled offer",
            description: offer.offeredDescription ?? "",
            imageUrl: offer.offeredImageUrl,
            repeatable: offer.offeredRepeatable ?? false,
          }
        : null,
      rejectionReason: offer.rejectReason ?? null,
    })),
  };

  return <OfferDetailView {...payload} />;
}
