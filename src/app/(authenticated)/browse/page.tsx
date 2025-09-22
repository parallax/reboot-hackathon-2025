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
    getActiveListings({
      selectedCategories,
    }),
    getTags(),
  ]);

  return (
    <BrowseItems
      listings={listingsResult}
      tags={tags}
      selectedCategories={selectedCategories}
    />
  );
}
