"use server";

import { db } from "@/db";
import { offers, offerHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

interface CreateOfferParams {
  itemId: number;
  offeredItemId: number;
  offererUserId: string;
  expiryDays?: number; // Default to 7 days if not provided
}

export async function createOffer({ 
  itemId, 
  offeredItemId, 
  expiryDays = 7 
}: CreateOfferParams) {
  try {
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
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

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

    return {
      success: true,
      data: {
        offerId: newOffer.id,
        offerHistoryId: newOfferHistory.id,
        expiry: expiryDate,
      }
    };
  } catch (error) {
    console.error("Error creating offer:", error);
    return {
      success: false,
      error: "Failed to create offer",
    };
  }
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
