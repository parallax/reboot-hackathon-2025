import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { tags, userPreferences, userTags } from "@/db/schema";

import { ProfileSetupForm } from "@/app/profile-setup/profile-setup-form";
import { submitProfileSetup } from "@/app/profile-setup/actions";

export default async function UserPreferencesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [availableTags, existingUserTags, userRecord] = await Promise.all([
    db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .orderBy(asc(tags.name)),
    db
      .select({ tagId: userTags.tagId, isOffer: userTags.isOffer })
      .from(userTags)
      .where(eq(userTags.userId, userId)),
    db
      .select({ location: userPreferences.location })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
  ]);

  const interestedTagIds = existingUserTags
    .filter((entry) => entry.tagId != null && !entry.isOffer)
    .map((entry) => entry.tagId as number);

  const offerTagIds = existingUserTags
    .filter((entry) => entry.tagId != null && entry.isOffer)
    .map((entry) => entry.tagId as number);

  const location = userRecord[0]?.location ?? "";

  return (
    <div className="flex flex-col bg-surface p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2">
          Manage preferences
        </h1>
        <p className="text-muted-content">
          Update your location and the tags you&apos;re interested in or can offer
        </p>
      </div>

      <ProfileSetupForm
        tags={availableTags}
        initialInterested={interestedTagIds}
        initialOffers={offerTagIds}
        initialLocation={location}
        onSubmit={submitProfileSetup}
      />
    </div>
  );
}
