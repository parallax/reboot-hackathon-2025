"use client";

import { useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  History,
  RefreshCcwDot,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ItemSummary = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
};

type OfferEntry = {
  id: number;
  createdAt: string | null;
  expiry: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  offeredItem: ItemSummary | null;
};

export type OfferDetailViewProps = {
  item: ItemSummary;
  offers: OfferEntry[];
};

type OfferStatus = "pending" | "accepted" | "rejected";

const STATUS_COPY: Record<OfferStatus, string> = {
  pending: "Awaiting your response",
  accepted: "Accepted",
  rejected: "Declined",
};

const STATUS_BADGE: Record<OfferStatus, string> = {
  pending: "bg-amber-200/70 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200",
  accepted: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-rose-200/70 text-rose-900 dark:bg-rose-500/15 dark:text-rose-300",
};

function resolveStatus(offer: OfferEntry): OfferStatus {
  if (offer.acceptedAt) return "accepted";
  if (offer.rejectedAt) return "rejected";
  return "pending";
}

export function OfferDetailView({ item, offers }: OfferDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "history">("recent");

  const latestOffer = useMemo(() => offers.at(0) ?? null, [offers]);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const formatDateTime = (value: string | null) =>
    value ? dateFormatter.format(new Date(value)) : "Not set";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 overflow-hidden bg-surface px-4 pb-16 pt-10 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[140px]"
      />

      <header className="relative flex flex-col gap-6 rounded-3xl border border-emerald-500/20 bg-surface-secondary/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-secondary-content">
            <ShieldCheck className="size-5 text-emerald-500" />
            <span className="text-sm font-medium">
              Only you can view offers for this listing
            </span>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/browse">
              <ArrowLeft className="mr-2 size-4" />
              Back to browse
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <Badge className="w-fit bg-emerald-600/90 text-white shadow-sm">
            Offer inbox
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-primary-content sm:text-4xl">
              {item.title}
            </h1>
            <p className="max-w-3xl text-secondary-content">
              {item.description}
            </p>
          </div>

          <div className="inline-flex w-full items-center justify-between gap-4 rounded-full border border-emerald-500/20 bg-surface-tertiary/60 p-1 sm:w-auto">
            {(
              [
                { key: "recent" as const, label: "Latest offer", icon: WandSparkles },
                { key: "history" as const, label: "Offer history", icon: History },
              ] satisfies Array<{
                key: "recent" | "history";
                label: string;
                icon: ComponentType<{ className?: string }>;
              }>
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  activeTab === key
                    ? "bg-emerald-500/95 text-white shadow"
                    : "text-secondary-content hover:text-primary"
                }`}
              >
                <Icon className={`size-4 ${activeTab === key ? "scale-110" : "opacity-70"}`} />
                {label}
                {key === "history" && offers.length > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-black/10 px-2 text-xs text-primary-content dark:bg-white/10">
                    {offers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="relative z-10 flex flex-col gap-6">
        {activeTab === "recent" ? (
          <LatestOfferPanel
            item={item}
            latestOffer={latestOffer}
            formatDateTime={formatDateTime}
          />
        ) : (
          <OfferHistoryPanel
            item={item}
            offers={offers}
            formatDateTime={formatDateTime}
          />
        )}
      </section>
    </div>
  );
}

function LatestOfferPanel({
  item,
  latestOffer,
  formatDateTime,
}: {
  item: ItemSummary;
  latestOffer: OfferEntry | null;
  formatDateTime: (value: string | null) => string;
}) {
  if (!latestOffer) {
    return (
      <EmptyState
        title="No offers yet"
        description="When someone proposes a swap for this listing, the full offer will appear here."
      />
    );
  }

  const status = resolveStatus(latestOffer);

  return (
    <Card className="overflow-hidden border border-emerald-500/15 bg-surface-secondary/80 shadow-lg">
      <CardHeader className="flex flex-col gap-3 border-b border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl text-primary-content">
              Latest offer overview
            </CardTitle>
            <CardDescription className="text-secondary-content">
              Received {formatDateTime(latestOffer.createdAt)}
            </CardDescription>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow-sm ${STATUS_BADGE[status]}`}
          >
            <RefreshCcwDot className="size-4" />
            {STATUS_COPY[status]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OfferItemCard item={item} label="What you're offering" accent="owner" />
          <OfferItemCard
            item={latestOffer.offeredItem}
            label="What they're proposing"
            accent="partner"
          />
        </div>

        <Separator className="bg-emerald-500/10" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OfferMeta
            icon={Clock}
            label="Created"
            value={formatDateTime(latestOffer.createdAt)}
          />
          <OfferMeta
            icon={WandSparkles}
            label="Expiry"
            value={latestOffer.expiry ? formatDateTime(latestOffer.expiry) : "Open offer"}
          />
          <OfferMeta
            icon={RefreshCcwDot}
            label="Status"
            value={STATUS_COPY[status]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function OfferHistoryPanel({
  item,
  offers,
  formatDateTime,
}: {
  item: ItemSummary;
  offers: OfferEntry[];
  formatDateTime: (value: string | null) => string;
}) {
  if (offers.length === 0) {
    return (
      <EmptyState
        title="Offer history will live here"
        description="Each counter offer, acceptance, or decline will build up a transparent timeline."
      />
    );
  }

  return (
    <div className="relative flex flex-col gap-6 before:absolute before:left-1 before:top-4 before:h-[calc(100%-1rem)] before:w-px before:bg-emerald-500/15">
      {offers.map((offer, index) => {
        const status = resolveStatus(offer);
        const isMostRecent = index === 0;

        return (
          <div key={offer.id} className="relative pl-6">
            <span
              aria-hidden
              className={`absolute left-0 top-3 inline-flex size-3 -translate-x-1/2 rounded-full border border-white/40 shadow-sm ${
                isMostRecent ? "bg-emerald-500" : "bg-emerald-500/40"
              }`}
            />
            <Card className="overflow-hidden border border-emerald-500/15 bg-surface-secondary/80 shadow-lg">
              <CardHeader className="flex flex-col gap-2 border-b border-emerald-500/10 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-primary-content">
                      {isMostRecent ? "Most recent exchange" : `Offer #${offers.length - index}`}
                    </CardTitle>
                    <CardDescription className="text-secondary-content">
                      Logged {formatDateTime(offer.createdAt)}
                    </CardDescription>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${STATUS_BADGE[status]}`}
                  >
                    {STATUS_COPY[status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <OfferItemCard
                    item={item}
                    label="Your item"
                    accent="owner"
                    subdued
                  />
                  <OfferItemCard
                    item={offer.offeredItem}
                    label="Their item"
                    accent="partner"
                    subdued
                  />
                </div>

                <div className="grid gap-3 text-sm text-secondary-content sm:grid-cols-2">
                  <span>
                    <strong className="mr-1 font-medium text-primary-content">Created:</strong>
                    {formatDateTime(offer.createdAt)}
                  </span>
                  <span>
                    <strong className="mr-1 font-medium text-primary-content">Expiry:</strong>
                    {offer.expiry ? formatDateTime(offer.expiry) : "Open offer"}
                  </span>
                  <span>
                    <strong className="mr-1 font-medium text-primary-content">Accepted:</strong>
                    {offer.acceptedAt ? formatDateTime(offer.acceptedAt) : "—"}
                  </span>
                  <span>
                    <strong className="mr-1 font-medium text-primary-content">Rejected:</strong>
                    {offer.rejectedAt ? formatDateTime(offer.rejectedAt) : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function OfferItemCard({
  item,
  label,
  accent,
  subdued = false,
}: {
  item: ItemSummary | null;
  label: string;
  accent: "owner" | "partner";
  subdued?: boolean;
}) {
  const accentClass =
    accent === "owner"
      ? "from-emerald-400/20 to-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : "from-sky-400/20 to-sky-500/10 text-sky-700 dark:text-sky-200";

  const imageSrc = item?.imageUrl || "/replace-this.jpg";

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-emerald-500/10 bg-surface-tertiary/60 p-5 shadow-inner ${
        subdued ? "opacity-90" : ""
      }`}
    >
      <div
        className={`mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r ${accentClass} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
      >
        {label}
      </div>
      {item ? (
        <>
          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl">
            <Image
              src={imageSrc}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-xl border border-white/10" />
          </div>
          <h3 className="text-lg font-semibold text-primary-content">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-3 text-sm text-secondary-content">
            {item.description || "No description provided."}
          </p>
          <Badge variant="outline" className="mt-3">
            {item.repeatable ? "Repeatable" : "One-off"}
          </Badge>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-emerald-500/30 bg-white/10 p-6 text-center text-sm text-secondary-content dark:bg-black/10">
          The offerer removed their item from the swap.
        </div>
      )}
    </div>
  );
}

function OfferMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/10 bg-surface-tertiary/60 p-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary-content">
          {label}
        </span>
        <span className="text-sm font-medium text-primary-content">{value}</span>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border border-dashed border-emerald-500/30 bg-surface-secondary/60 text-center shadow-none">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <WandSparkles className="size-10 text-emerald-400" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary-content">{title}</h2>
          <p className="mx-auto max-w-md text-secondary-content">{description}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/browse">
            <ArrowLeft className="mr-2 size-4" />
            Discover new listings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
