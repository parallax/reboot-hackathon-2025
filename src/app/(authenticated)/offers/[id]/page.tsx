import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import { OfferDetailView, type OfferDetailViewProps } from "./offer-detail-view";

type OfferPageProps = {
  params: {
    id: string;
  };
};

export default async function OfferPage({ params }: OfferPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const itemId = Number(params.id);

  if (!Number.isFinite(itemId)) {
    notFound();
  }

  const [itemRecord] = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      imageUrl: items.imageUrl,
      repeatable: items.repeatable,
      userId: items.userId,
    })
    .from(items)
    .where(eq(items.id, itemId));

  if (!itemRecord) {
    notFound();
  }

  if (itemRecord.userId !== userId) {
    notFound();
  }

  const offeredItems = alias(items, "offered_items");

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
    })
    .from(offerHistory)
    .leftJoin(offeredItems, eq(offeredItems.id, offerHistory.offeredItemId))
    .where(eq(offerHistory.itemId, itemId))
    .orderBy(desc(offerHistory.createdAt));

  const payload: OfferDetailViewProps = {
    item: {
      id: itemRecord.id,
      title: itemRecord.title,
      description: itemRecord.description,
      imageUrl: itemRecord.imageUrl,
      repeatable: itemRecord.repeatable,
    },
    offers: offerRows.map((offer) => ({
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
    })),
  };

  return <OfferDetailView {...payload} />;
}
