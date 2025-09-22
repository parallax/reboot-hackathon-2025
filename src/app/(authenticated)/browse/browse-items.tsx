"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { RefreshCcwDot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Tag {
  id: number;
  name: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  userId: string;
  tagId: number | null;
  tagName: string | null;
}

interface BrowseItemsProps {
  listings: Listing[];
  tags: Tag[];
  selectedCategory: string;
}

export function BrowseItems({
  listings,
  tags,
  selectedCategory,
}: BrowseItemsProps) {
  const router = useRouter();

  const categories = [
    { value: "all", label: "All Categories" },
    ...tags.map((tag) => ({ value: String(tag.id), label: tag.name })),
  ];

  const handleCategoryChange = (value: string) => {
    // Update the URL with the selected category
    const params = new URLSearchParams();
    if (value !== "all") {
      params.set("category", value);
    }

    // Navigate to the new URL which will trigger a server-side rerender
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-col bg-surface p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-content mb-2">
          Browse Listings
        </h1>
        <p className="text-muted-content">
          Find what you need from local businesses
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-content mb-2">
          Filter by category
        </label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  href={`/listing/${listing.id}`}
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
              <div className="flex items-center">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  {listing.tagName || "Uncategorized"}
                </span>
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
