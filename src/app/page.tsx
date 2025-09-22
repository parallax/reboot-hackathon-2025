import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { MarketingLanding } from "@/components/marketing-landing";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const [profile] = await db
      .select({ onboardingComplete: userPreferences.onboardingComplete })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (!profile?.onboardingComplete) {
      redirect("/profile-setup");
    }

    redirect("/browse");
  }

  return <MarketingLanding />;
}
