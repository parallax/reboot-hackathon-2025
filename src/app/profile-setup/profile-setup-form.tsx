"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

type ProfileSetupFormValues = {
  location: string;
  interestedIds: string[];
  offerIds: string[];
};

export function ProfileSetupForm({
  tags,
  initialInterested,
  initialOffers,
  initialLocation,
  onSubmit,
}: ProfileSetupFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const toNumericIds = (ids: string[]) =>
    ids
      .map((id) => Number.parseInt(id, 10))
      .filter((value) => Number.isFinite(value));

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ value: tag.id.toString(), label: tag.name })),
    [tags]
  );

  const form = useForm<ProfileSetupFormValues>({
    defaultValues: {
      location: initialLocation,
      interestedIds: initialInterested.map((id) => id.toString()),
      offerIds: initialOffers.map((id) => id.toString()),
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      const result = await onSubmit({
        location: values.location,
        interestedTagIds: toNumericIds(values.interestedIds),
        offerTagIds: toNumericIds(values.offerIds),
      });

      if (!result.success) {
        setSubmissionError(
          result.error ?? "Failed to save your profile. Please try again."
        );
        return;
      }

      router.push("/browse");
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your profile."
      );
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your location</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Leeds City Centre, West Yorkshire"
                  aria-label="Your location"
                />
              </FormControl>
              <FormDescription>
                We&apos;ll use this to surface nearby matches first.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestedIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I&apos;m interested in</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tagOptions}
                  defaultValue={field.value ?? []}
                  onValueChange={field.onChange}
                  placeholder="Select the skills or items you're seeking"
                  emptyIndicator="No tags match your search"
                  hideSelectAll
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offerIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I can offer</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tagOptions}
                  defaultValue={field.value ?? []}
                  onValueChange={field.onChange}
                  placeholder="Choose what you can provide"
                  emptyIndicator="No tags match your search"
                  hideSelectAll
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submissionError && (
          <p className="text-sm text-destructive">{submissionError}</p>
        )}

        <Button
          type="submit"
          className="w-full py-6 body-large"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving preferences…"
            : "Complete profile"}
        </Button>
      </form>
    </Form>
  );
}
