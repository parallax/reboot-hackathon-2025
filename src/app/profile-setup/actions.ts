"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { userTags, users } from "@/db/schema";

export type ProfileSetupInput = {
  location: string;
  interestedTagIds: number[];
  offerTagIds: number[];
};

export type ProfileSetupResult =
  | { success: true }
  | { success: false; error: string };

const dedupeIds = (source: number[]) => {
  const seen = new Set<number>();
  const unique: number[] = [];

  for (const candidate of source) {
    if (Number.isInteger(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
      unique.push(candidate);
    }
  }

  return unique;
};

export async function submitProfileSetup(
  payload: ProfileSetupInput
): Promise<ProfileSetupResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You need to be signed in to continue." };
  }

  const location = payload.location.trim();
  const interestedTagIds = dedupeIds(payload.interestedTagIds ?? []);
  const offerTagIds = dedupeIds(payload.offerTagIds ?? []);

  if (!location && interestedTagIds.length === 0 && offerTagIds.length === 0) {
    return {
      success: false,
      error: "Add a location or select at least one tag to continue.",
    };
  }

  const completedAt = new Date();

  await db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values({
        id: userId,
        location: location || null,
        onboardingComplete: completedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          location: location || null,
          onboardingComplete: completedAt,
        },
      });

    await tx.delete(userTags).where(eq(userTags.userId, userId));

    const rowsToInsert = [
      ...interestedTagIds.map((tagId) => ({
        userId,
        tagId,
        isOffer: false,
      })),
      ...offerTagIds.map((tagId) => ({
        userId,
        tagId,
        isOffer: true,
      })),
    ];

    if (rowsToInsert.length > 0) {
      await tx.insert(userTags).values(rowsToInsert);
    }
  });

  revalidatePath("/browse");

  return { success: true };
}
