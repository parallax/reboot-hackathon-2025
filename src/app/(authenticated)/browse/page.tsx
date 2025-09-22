import { getActiveListings } from "@/lib/listings-actions";
import { getTags } from "@/lib/tags-utils";
import { BrowseItems } from "./browse-items";

export default async function Page(props: PageProps<"/browse">) {
  const searchParams = await props.searchParams;

  // Get categories from searchParams
  const selectedCategories = searchParams.categories
    ? (searchParams.categories as string).split(",")
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
