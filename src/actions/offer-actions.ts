"use server";

import { db } from "@/db";
import { offers, offerHistory, items } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendOfferEmail } from "./send-offer-email";

interface CreateOfferParams {
  itemId: number;
  offeredItemId: number;
  offererUserId: string;
  expiryDays?: number; // Default to 7 days if not provided
}

export async function createOffer({
  itemId,
  offeredItemId,
}: CreateOfferParams) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Create the offer record
  const [newOffer] = await db
    .insert(offers)
    .values({
      createdAt: new Date(),
    })
    .returning();

  if (!newOffer) {
    throw new Error("Failed to create offer");
  }

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  // Create the offer history record
  const [newOfferHistory] = await db
    .insert(offerHistory)
    .values({
      itemId,
      offeredItemId,
      expiry: expiryDate,
      createdAt: new Date(),
    })
    .returning();

  if (!newOfferHistory) {
    throw new Error("Failed to create offer history");
  }

  // Then send email notification to the item owner
  await sendOfferEmail({
    itemId: itemId,
    offeredItemId: offeredItemId,
    offerId: newOfferHistory.id,
    offererUserId: userId,
  });

  redirect(`/offers`);
}

export async function respondToOffer({
  offerHistoryId,
  decision,
  reason,
}: {
  offerHistoryId: number;
  decision: "accept" | "reject";
  reason?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const [record] = await db
    .select({
      offerId: offerHistory.id,
      itemId: offerHistory.itemId,
      itemOwnerId: items.userId,
    })
    .from(offerHistory)
    .innerJoin(items, eq(items.id, offerHistory.itemId))
    .where(eq(offerHistory.id, offerHistoryId))
    .limit(1);

  if (!record) {
    return { success: false, error: "Offer not found" };
  }

  if (record.itemOwnerId !== userId) {
    return { success: false, error: "You are not authorised to respond to this offer" };
  }

  if (decision === "reject") {
    const message = reason?.trim();
    if (!message) {
      return { success: false, error: "Decline reason is required" };
    }

    await db
      .update(offerHistory)
      .set({
        acceptedAt: null,
        rejectedAt: new Date(),
        rejectReason: message,
      })
      .where(eq(offerHistory.id, offerHistoryId));
  } else {
    await db
      .update(offerHistory)
      .set({
        acceptedAt: new Date(),
        rejectedAt: null,
        rejectReason: null,
      })
      .where(eq(offerHistory.id, offerHistoryId));
  }

  revalidatePath(`/offers/${record.itemId}`);
  revalidatePath(`/offers`);

  return { success: true as const };
}

export async function getOfferById(offerId: number) {
  try {
    const offer = await db
      .select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    if (offer.length === 0) {
      return {
        success: false,
        error: "Offer not found",
      };
    }

    return {
      success: true,
      data: offer[0],
    };
  } catch (error) {
    console.error("Error fetching offer:", error);
    return {
      success: false,
      error: "Failed to fetch offer",
    };
  }
}

export async function getOfferHistoryByOfferId(offerId: number) {
  try {
    // This would need to be implemented based on how you want to link offers to offer history
    // For now, we'll return the offer history by itemId
    const offerHistoryRecords = await db
      .select()
      .from(offerHistory)
      .where(eq(offerHistory.itemId, offerId));

    return {
      success: true,
      data: offerHistoryRecords,
    };
  } catch (error) {
    console.error("Error fetching offer history:", error);
    return {
      success: false,
      error: "Failed to fetch offer history",
    };
  }
}
