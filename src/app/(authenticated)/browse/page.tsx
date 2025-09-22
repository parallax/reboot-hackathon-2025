import { getActiveListings } from "@/lib/listings-actions";
import { getTags } from "@/lib/tags-utils";
import { BrowseItems } from "./browse-items";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  // Get category from searchParams or default to "all"
  const selectedCategory = searchParams.category || "all";

  // Fetch data
  const [listingsResult, tags] = await Promise.all([
    getActiveListings(),
    getTags(),
  ]);

  const listings = listingsResult.success ? listingsResult.data : [];

  // Filter listings server-side based on the category
  const filteredListings =
    selectedCategory === "all"
      ? listings || []
      : listings?.filter(
          (listing) => listing.id?.toString() === selectedCategory
        ) || [];
  return (
    <BrowseItems
      listings={filteredListings}
      tags={tags}
      selectedCategory={selectedCategory}
    />
  );
}
