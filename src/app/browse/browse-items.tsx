"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Item, Tag } from "@/db/schema";

interface BrowseItemsProps {
  listings: Item[];
  tags: Tag[];
  selectedCategories: string[];
}

export function BrowseItems({
  listings,
  tags,
  selectedCategories,
}: BrowseItemsProps) {
  const router = useRouter();

  const categories = tags.map((tag) => ({
    value: String(tag.id),
    label: tag.name,
  }));

  // Debug logging
  console.log("BrowseItems - selectedCategories:", selectedCategories);
  console.log("BrowseItems - categories:", categories);

  const handleCategoriesChange = (values: string[]) => {
    // Update the URL with the selected categories
    const params = new URLSearchParams();

    if (values.length > 0) {
      params.set("categories", values.join(","));
    }

    // Navigate to the new URL which will trigger a server-side rerender
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-col bg-surface py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-content">
          Browse Listings
        </h1>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-content mb-2">
          Filter by category
        </label>
        <MultiSelect
          options={categories}
          value={selectedCategories}
          onValueChange={handleCategoriesChange}
          placeholder="Select categories"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="bg-surface-secondary border-input relative"
          >
            <div className="relative h-48 w-full">
              <Image
                src={listing.imageUrl || "/replace-this.jpg"}
                alt={listing.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-primary-content">
                <Link
                  href={`/items/${listing.id}`}
                  className="hover:text-primary transition-colors after:absolute after:inset-0 after:content-[''] after:z-10"
                >
                  {listing.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-secondary-content">
                {listing.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {listing.itemTags && listing.itemTags.length > 0 ? (
                  listing.itemTags.map((tag) => (
                    <span
                      key={tag.tag?.id || "uncategorised"}
                      className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded"
                    >
                      {tag.tag?.name || "Uncategorised"}
                    </span>
                  ))
                ) : (
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    Uncategorised
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-content">
            No listings match your selected category
          </p>
        </div>
      )}
    </div>
  );
}
