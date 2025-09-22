"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const profileSetupSchema = z.object({
  location: z
    .string()
    .default("")
    .transform((value) => value.trim()),
  interestedIds: z.array(z.number()).default([]),
  offerIds: z.array(z.number()).default([]),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export function ProfileSetupForm({
  tags,
  initialInterested,
  initialOffers,
  initialLocation,
  onSubmit,
}: ProfileSetupFormProps) {
  const router = useRouter();
  const tagOptions = useMemo(
    () => tags.map((tag) => ({ value: tag.id, label: tag.name })),
    [tags]
  );

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      location: initialLocation,
      interestedIds: initialInterested,
      offerIds: initialOffers,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (
      !values.location &&
      values.interestedIds.length === 0 &&
      values.offerIds.length === 0
    ) {
      form.setError("root", {
        type: "manual",
        message: "Add a location or select at least one tag to continue.",
      });
      return;
    }

    form.clearErrors("root");

    try {
      const result = await onSubmit({
        location: values.location,
        interestedTagIds: values.interestedIds,
        offerTagIds: values.offerIds,
      });

      if (!result.success) {
        form.setError("root", {
          type: "server",
          message:
            result.error ?? "Failed to save your profile. Please try again.",
        });
        return;
      }

      router.push("/browse");
    } catch (submissionError) {
      form.setError("root", {
        type: "server",
        message:
          submissionError instanceof Error
            ? submissionError.message
            : "Something went wrong while saving your profile.",
      });
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
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select the skills or items you&apos;re seeking"
                  emptyMessage="No tags match your search"
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
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Choose what you can provide"
                  emptyMessage="No tags match your search"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
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
