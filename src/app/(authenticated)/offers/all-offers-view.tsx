"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  Inbox,
  ShieldCheck,
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
import type { Item, OfferHistory } from "@/db/schema";

export type ItemSummary = Pick<
  Item,
  "id" | "title" | "description" | "imageUrl" | "repeatable"
>;

export type OfferEntry = Pick<
  OfferHistory,
  "id" | "createdAt" | "expiry" | "acceptedAt" | "rejectedAt"
> & {
  offeredItem: ItemSummary | null;
  rejectionReason: OfferHistory["rejectReason"] | null;
};

export type OfferGroup = {
  item: ItemSummary;
  offers: OfferEntry[];
};

type OfferStatus = "pending" | "accepted" | "rejected";

type OfferContext = "received" | "sent";

const STATUS_LABEL: Record<OfferStatus, string> = {
  pending: "Awaiting response",
  accepted: "Accepted",
  rejected: "Declined",
};

const STATUS_BADGE: Record<OfferStatus, string> = {
  pending:
    "bg-amber-200/70 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  accepted:
    "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected:
    "bg-rose-200/70 text-rose-900 dark:bg-rose-500/15 dark:text-rose-300",
};

function resolveStatus(offer: OfferEntry): OfferStatus {
  if (offer.acceptedAt) return "accepted";
  if (offer.rejectedAt) return "rejected";
  return "pending";
}

type AllOffersViewProps = {
  received: OfferGroup[];
  sent: OfferGroup[];
};

export function AllOffersView({ received, sent }: AllOffersViewProps) {
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const formatDate = (value: Date | null) =>
    value ? dateFormatter.format(value) : "Not set";

  const hasReceived = received.length > 0;
  const hasSent = sent.length > 0;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-surface px-4 pb-20 pt-10 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[140px]"
      />

      <header className="relative flex flex-col gap-5 rounded-3xl border border-emerald-500/20 bg-surface-secondary/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-secondary-content">
            <ShieldCheck className="size-5 text-emerald-500" />
            <span className="text-sm font-medium">
              Track every exchange you receive and send
            </span>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/browse">
              <ArrowRight className="mr-2 size-4" />
              Browse marketplace
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <Badge className="w-fit bg-emerald-600/90 text-white shadow-sm">
            Offer inbox
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold text-primary-content sm:text-4xl">
              All offers at a glance
            </h1>
            <p className="mt-2 max-w-3xl text-secondary-content">
              See new swap proposals on your listings and keep tabs on the
              offers you have in play elsewhere.
            </p>
          </div>
        </div>
      </header>

      {!hasReceived && !hasSent ? (
        <EmptyState />
      ) : (
        <div className="relative z-10 flex flex-col gap-12">
          <OfferSection
            title="Offers on your listings"
            description="Incoming swaps for items you own."
            groups={received}
            formatDate={formatDate}
            context="received"
          />

          <OfferSection
            title="Offers you have sent"
            description="Follow up on proposals you've made to other members."
            groups={sent}
            formatDate={formatDate}
            context="sent"
          />
        </div>
      )}
    </div>
  );
}

type OfferSectionProps = {
  title: string;
  description: string;
  groups: OfferGroup[];
  formatDate: (value: Date | null) => string;
  context: OfferContext;
};

function OfferSection({
  title,
  description,
  groups,
  formatDate,
  context,
}: OfferSectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-primary-content">{title}</h2>
        <p className="text-sm text-secondary-content">{description}</p>
      </div>

      {groups.length === 0 ? (
        <SectionPlaceholder context={context} />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {groups.map((group) => (
            <OfferGroupCard
              key={`${context}-${group.item.id}`}
              group={group}
              formatDate={formatDate}
              context={context}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type OfferGroupCardProps = {
  group: OfferGroup;
  formatDate: (value: Date | null) => string;
  context: OfferContext;
};

function OfferGroupCard({ group, formatDate, context }: OfferGroupCardProps) {
  const latestOffer = group.offers[0] ?? null;
  const latestStatus = latestOffer ? resolveStatus(latestOffer) : null;

  const headerBadgeLabel =
    context === "received" ? "Your listing" : "Offer sent";
  const headerButtonLabel =
    context === "received" ? "Review details" : "View offer";
  const headerButtonHref = `/offers/${group.item.id}`;
  const historyLabel =
    context === "received" ? "Offer history" : "Activity timeline";
  const latestSummaryLabel =
    context === "received"
      ? "Latest offer summary"
      : "Latest update on your offer";
  const offeredItemLabel =
    context === "received" ? "Offered item" : "What you offered";

  return (
    <Card className="relative overflow-hidden border border-emerald-500/10 bg-surface-secondary/80 shadow-lg">
      <CardHeader className="flex flex-col gap-4 border-b border-emerald-500/10 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative size-16 flex-none overflow-hidden rounded-xl border border-emerald-500/20 bg-surface-tertiary/60">
              {group.item.imageUrl ? (
                <Image
                  src={group.item.imageUrl}
                  alt={group.item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-secondary-content/60">
                  <ClipboardList className="size-6" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="border-emerald-400/40 bg-emerald-400/10 text-emerald-600"
                >
                  {headerBadgeLabel}
                </Badge>
                {group.item.repeatable ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-400/40 bg-emerald-400/10 text-emerald-600"
                  >
                    Repeatable
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-2xl text-primary-content">
                {group.item.title}
              </CardTitle>
              <CardDescription className="max-w-2xl text-secondary-content">
                {group.item.description}
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={headerButtonHref}>
              {headerButtonLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        {latestOffer ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/15 bg-surface-tertiary/60 p-4 text-sm text-secondary-content">
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary-content/70">
              {latestSummaryLabel}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-primary-content">
              <Badge
                className={`px-3 py-1 text-xs font-medium ${
                  latestStatus ? STATUS_BADGE[latestStatus] : ""
                }`}
              >
                {latestStatus ? STATUS_LABEL[latestStatus] : "No status"}
              </Badge>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-emerald-500" />
                Logged {formatDate(latestOffer.createdAt)}
              </span>
              <span className="inline-flex items-center gap-2 text-secondary-content/80">
                Expires {
                  latestOffer.expiry
                    ? formatDate(latestOffer.expiry)
                    : "Open offer"
                }
              </span>
            </div>
            {latestOffer.offeredItem ? (
              <p className="text-sm">
                {context === "received" ? "Swapped for " : "You offered "}
                <strong>{latestOffer.offeredItem.title}</strong>
              </p>
            ) : (
              <p className="text-sm">Offer details unavailable.</p>
            )}
            {latestStatus === "rejected" && latestOffer.rejectionReason ? (
              <p className="text-sm text-rose-500">
                Decline reason: {latestOffer.rejectionReason}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-5 py-6">
        <div className="flex items-center justify-between text-sm text-secondary-content">
          <span className="inline-flex items-center gap-2 font-medium text-primary-content">
            <Inbox className="size-4 text-emerald-500" />
            {historyLabel}
          </span>
          <span>
            {group.offers.length} entr{group.offers.length === 1 ? "y" : "ies"}
          </span>
        </div>
        <Separator className="bg-emerald-500/10" />

        <div className="space-y-4">
          {group.offers.map((offer) => {
            const status = resolveStatus(offer);

            return (
              <div
                key={offer.id}
                className="rounded-2xl border border-emerald-500/10 bg-surface-tertiary/60 p-4 text-sm text-secondary-content shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-primary-content">
                    <Badge
                      className={`px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </Badge>
                    <span>Created {formatDate(offer.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-secondary-content/80">
                    <span>
                      Expires {offer.expiry ? formatDate(offer.expiry) : "Open"}
                    </span>
                    <span>
                      Accepted {offer.acceptedAt ? formatDate(offer.acceptedAt) : "—"}
                    </span>
                    <span>
                      Declined {offer.rejectedAt ? formatDate(offer.rejectedAt) : "—"}
                    </span>
                  </div>
                </div>
                {offer.offeredItem ? (
                  <div className="mt-3 rounded-lg border border-emerald-500/10 bg-surface/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-secondary-content/70">
                      {offeredItemLabel}
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary-content">
                      {offer.offeredItem.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed line-clamp-3">
                      {offer.offeredItem.description ||
                        "No description provided."}
                    </p>
                  </div>
                ) : null}
                {status === "rejected" && offer.rejectionReason ? (
                  <p className="mt-3 text-sm text-rose-500">
                    Decline reason: {offer.rejectionReason}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

type SectionPlaceholderProps = {
  context: OfferContext;
};

function SectionPlaceholder({ context }: SectionPlaceholderProps) {
  if (context === "received") {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-500/30 bg-surface-secondary/50 p-8 text-secondary-content">
        <h3 className="text-lg font-semibold text-primary-content">
          No offers on your listings yet
        </h3>
        <p className="mt-2 text-sm leading-relaxed">
          Share more items or wait for the community to discover your listings.
          New swap proposals will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-emerald-500/30 bg-surface-secondary/50 p-8 text-secondary-content">
      <h3 className="text-lg font-semibold text-primary-content">
        You haven&apos;t made any offers yet
      </h3>
      <p className="mt-2 text-sm leading-relaxed">
        Browse the marketplace and propose a swap. We&apos;ll keep track of your
        offers and surface any updates right here.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-emerald-500/30 bg-surface-secondary/60 p-12 text-center shadow-inner">
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
        <Inbox className="size-10 text-emerald-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-primary-content">
          No offer activity yet
        </h2>
        <p className="max-w-lg text-secondary-content">
          Once you start trading with the community, you&apos;ll see incoming
          swaps and the offers you send all in one inbox.
        </p>
      </div>
      <Button asChild>
        <Link href="/browse">
          Discover listings
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}
