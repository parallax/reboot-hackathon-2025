import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { desc, eq, inArray, sql } from "drizzle-orm";
import {
  ClipboardList,
  Clock,
  Layers,
  ListChecks,
  MessageSquare,
  PlusCircle,
  RefreshCcwDot,
} from "lucide-react";

import { db } from "@/db";
import { items, offerHistory } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ListingStats = {
  totalOffers: number;
  pendingOffers: number;
  latestOfferAt: Date | null;
};

type ListingWithStats = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
  active: boolean;
} & ListingStats;

async function getListingsForViewer(
  userId: string
): Promise<ListingWithStats[]> {
  const baseItems = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      imageUrl: items.imageUrl,
      repeatable: items.repeatable,
      active: items.active,
    })
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.id));

  if (baseItems.length === 0) {
    return [];
  }

  const statsRows = await db
    .select({
      itemId: offerHistory.itemId,
      totalOffers: sql<number>`count(*)`.as("total_offers"),
      pendingOffers:
        sql<number>`count(*) filter (where ${offerHistory.acceptedAt} is null and ${offerHistory.rejectedAt} is null)`.as(
          "pending_offers"
        ),
      latestOfferAt: sql<Date | null>`max(${offerHistory.createdAt})`.as(
        "latest_offer_at"
      ),
    })
    .from(offerHistory)
    .where(
      inArray(
        offerHistory.itemId,
        baseItems.map((item) => item.id)
      )
    )
    .groupBy(offerHistory.itemId);

  const statsMap = new Map<number, ListingStats>();
  statsRows.forEach((row) => {
    if (!row.itemId) return;
    statsMap.set(row.itemId, {
      totalOffers: Number(row.totalOffers ?? 0),
      pendingOffers: Number(row.pendingOffers ?? 0),
      latestOfferAt: row.latestOfferAt,
    });
  });

  return baseItems.map((item) => {
    const stats = statsMap.get(item.id);
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      repeatable: item.repeatable,
      active: item.active,
      totalOffers: stats?.totalOffers ?? 0,
      pendingOffers: stats?.pendingOffers ?? 0,
      latestOfferAt: stats?.latestOfferAt ?? null,
    } satisfies ListingWithStats;
  });
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: Date | string | null) {
  if (!value) return "No offers yet";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "No offers yet";
  return dateFormatter.format(date);
}

export default async function MyListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const listings = await getListingsForViewer(userId);

  const totalListings = listings.length;
  const activeListings = listings.filter((item) => item.active).length;
  const totalOffers = listings.reduce((sum, item) => sum + item.totalOffers, 0);
  const pendingOffers = listings.reduce(
    (sum, item) => sum + item.pendingOffers,
    0
  );

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 bg-surface px-4 pb-16 pt-10 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[140px]"
      />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary-content">
            My listings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-secondary-content">
            Track every item you&apos;re offering and jump into active swap
            conversations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/offers">
              <RefreshCcwDot className="mr-2 size-4" />
              Review offers
            </Link>
          </Button>
          <Button asChild>
            <Link href="/create-item">
              <PlusCircle className="mr-2 size-4" />
              New listing
            </Link>
          </Button>
        </div>
      </div>

      {totalListings === 0 ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-emerald-500/30 bg-surface-secondary/60 p-12 text-center shadow-inner">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
            <ClipboardList className="size-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-primary-content">
              You haven&apos;t created any listings yet
            </h2>
            <p className="max-w-lg text-secondary-content">
              Showcase what you can trade and we&apos;ll route offers straight
              back to you.
            </p>
          </div>
          <Button asChild>
            <Link href="/create-item">
              <PlusCircle className="mr-2 size-4" />
              Create your first listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="relative z-10 space-y-8">
          <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <SummaryCard
              icon={<Layers className="size-3 text-emerald-500" />}
              label="Total listings"
              value={totalListings}
            />
            <SummaryCard
              icon={<ListChecks className="size-3 text-emerald-500" />}
              label="Active"
              value={activeListings}
            />
            <SummaryCard
              icon={<MessageSquare className="size-3 text-emerald-500" />}
              label="Offers received"
              value={totalOffers}
            />
            <SummaryCard
              icon={<Clock className="size-3 text-emerald-500" />}
              label="Pending"
              value={pendingOffers}
            />
          </section>

          <section className="space-y-5">
            <header className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-primary-content">
                Active portfolio
              </h2>
              <p className="text-sm text-secondary-content">
                Dive into any listing to fine-tune details or respond to fresh
                offers.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-5">
              {listings.map((item) => (
                <Card
                  key={item.id}
                  className="border border-emerald-500/10 bg-surface-secondary/80 shadow-sm"
                >
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pt-4">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                      <div className="relative size-20 flex-none overflow-hidden rounded-xl border border-emerald-500/20 bg-surface-tertiary/60">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-secondary-content/60">
                            <ClipboardList className="size-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl text-primary-content">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-secondary-content">
                          {item.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge
                            variant={item.active ? "default" : "secondary"}
                            className={
                              item.active
                                ? "bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                            }
                          >
                            {item.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 text-primary-content"
                          >
                            {item.repeatable ? "Repeatable" : "One-time"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 text-primary-content"
                          >
                            {item.totalOffers === 1
                              ? "1 offer"
                              : `${item.totalOffers} offers`}
                          </Badge>
                          {item.pendingOffers > 0 ? (
                            <Badge className="bg-amber-200/70 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                              {item.pendingOffers} pending
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-none flex-col gap-2 sm:items-end">
                      <p className="text-xs uppercase tracking-wide text-secondary-content/70">
                        Last activity
                      </p>
                      <p className="text-sm text-primary-content">
                        {formatDate(item.latestOfferAt)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 border-t border-emerald-500/10 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/items/${item.id}`}>View listing</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/edit-item/${item.id}`}>Edit details</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/offers/${item.id}`}>Manage offers</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <Card className="border border-emerald-500/10 bg-surface-secondary/80 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-4 items-center justify-center text-emerald-500">
            {icon}
          </span>
          <span className="text-xs text-secondary-content font-medium">
            {label}
          </span>
        </div>
        <p className="text-lg font-semibold text-primary-content">{value}</p>
      </div>
    </Card>
  );
}
