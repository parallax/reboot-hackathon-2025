"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";

export type ClearOnboardingStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function clearOnboardingStatus(): Promise<ClearOnboardingStatusResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "You need to be signed in to use debug tools.",
    };
  }

  try {
    await db
      .insert(userPreferences)
      .values({ userId, onboardingComplete: null })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { onboardingComplete: null },
      });

    revalidatePath("/");
    revalidatePath("/profile-setup");

    return { success: true };
  } catch (error) {
    console.error("Failed to clear onboarding status", error);

    return {
      success: false,
      error: "Could not clear onboarding status. Check server logs for details.",
    };
  }
}
