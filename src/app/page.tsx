import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { LandingPage } from "@/components/landing-page";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const [profile] = await db
      .select({ onboardingComplete: users.onboardingComplete })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile?.onboardingComplete) {
      redirect("/profile-setup");
    }

    redirect("/browse");
  }

  return <LandingPage />;
}
