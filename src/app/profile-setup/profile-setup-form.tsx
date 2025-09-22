"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import type { ProfileSetupInput, ProfileSetupResult } from "./actions";

type TagOption = {
  id: number;
  name: string;
};

type ProfileSetupFormProps = {
  tags: TagOption[];
  initialInterested: number[];
  initialOffers: number[];
  initialLocation: string;
  onSubmit: (payload: ProfileSetupInput) => Promise<ProfileSetupResult>;
};

export function ProfileSetupForm({
  tags,
  initialInterested,
  initialOffers,
  initialLocation,
  onSubmit,
}: ProfileSetupFormProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [interestedIds, setInterestedIds] = useState<number[]>(initialInterested);
  const [offerIds, setOfferIds] = useState<number[]>(initialOffers);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!location.trim() && interestedIds.length === 0 && offerIds.length === 0) {
      setError("Add a location or select at least one tag to continue.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const result = await onSubmit({
        location: location.trim(),
        interestedTagIds: interestedIds,
        offerTagIds: offerIds,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to save your profile. Please try again.");
        return;
      }

      router.push("/browse");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while saving your profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section>
        <label className="block text-sm font-medium text-secondary-content mb-2">
          Your Location
        </label>
        <Input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Leeds City Centre, West Yorkshire"
          aria-label="Your location"
        />
        <p className="mt-2 text-xs text-muted-content">
          We&apos;ll use this to surface nearby matches first.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary-content">I&apos;m interested in</h2>
        <MultiSelect
          options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
          value={interestedIds.map((id) => id.toString())}
          onChange={(value) => setInterestedIds(value.map((id) => parseInt(id)))}
          placeholder="Select the skills or items you&apos;re seeking"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary-content">I can offer</h2>
        <MultiSelect
          options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
          value={offerIds.map((id) => id.toString())}
          onChange={(value) => setOfferIds(value.map((id) => parseInt(id))) }
          placeholder="Choose what you can provide"
        />
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full py-6 body-large" disabled={isSaving}>
        {isSaving ? "Saving preferences…" : "Complete profile"}
      </Button>
    </form>
  );
}
