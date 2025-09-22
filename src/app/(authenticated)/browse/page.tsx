import { getActiveListings } from "@/lib/listings-actions";
import { getTags } from "@/lib/tags-utils";
import { BrowseItems } from "./browse-items";

// Define the page props type
type PageProps = {
  searchParams: {
    categories?: string;
  };
};

export default async function BrowsePage({ searchParams }: PageProps) {
  // Get categories from searchParams
  const selectedCategories = searchParams.categories
    ? searchParams.categories.split(",")
    : [];

  // Fetch data
  const [listingsResult, tags] = await Promise.all([
    getActiveListings(),
    getTags(),
  ]);

  const listings = listingsResult.success ? listingsResult.data : [];

  // Filter listings server-side based on the selected categories
  const filteredListings =
    selectedCategories.length === 0
      ? listings || []
      : listings?.filter(
          (listing) =>
            listing.tagId &&
            selectedCategories.includes(listing.tagId.toString())
        ) || [];

  return (
    <BrowseItems
      listings={filteredListings}
      tags={tags}
      selectedCategories={selectedCategories}
    />
  );
}
