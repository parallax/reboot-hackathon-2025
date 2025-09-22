import {
  getActiveListings,
  getUserPreferredCategories,
} from "@/lib/listings-actions";
import { getTags } from "@/lib/tags-utils";
import { BrowseItems } from "./browse-items";

export default async function Page(props: PageProps<"/browse">) {
  const searchParams = await props.searchParams;

  // Get categories from searchParams
  let selectedCategories = searchParams.categories
    ? (searchParams.categories as string).split(",")
    : [];

  // If no categories are selected from URL, use user's preferred categories
  if (selectedCategories.length === 0) {
    selectedCategories = await getUserPreferredCategories();
  }

  console.log("Browse page - selectedCategories:", selectedCategories);

  // Fetch data
  const [listingsResult, tags] = await Promise.all([
    getActiveListings({
      selectedCategories,
      excludeCurrentUser: true,
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
