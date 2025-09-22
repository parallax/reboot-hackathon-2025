import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RefreshCcwDot } from "lucide-react";

export default async function OffersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col bg-surface p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2 flex items-center gap-2">
          <RefreshCcwDot className="h-6 w-6 text-primary" />
          My Offers
        </h1>
        <p className="text-muted-content">
          View and manage your active offers and offer history
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RefreshCcwDot className="h-16 w-16 text-muted-content mb-4" />
        <h2 className="text-xl font-semibold text-primary-content mb-2">
          No offers yet
        </h2>
        <p className="text-muted-content mb-6 max-w-md">
          When you make offers on items or receive offers on your listings,
          they&apos;ll appear here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/browse"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Browse Listings
          </a>
          <a
            href="/create-item"
            className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            Create Listing
          </a>
        </div>
      </div>
    </div>
  );
}
