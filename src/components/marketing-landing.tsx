"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingLanding() {
  return (
    <div className="min-h-screen bg-surface">
      <main>
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-accent/5">
          <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10 items-center relative overflow-hidden">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Swap skills. <br /> Share resources. <br /> Strengthen Leeds.
              </h1>
              <p className="mt-4 text-secondary-content text-lg">
                A premium, eco-tech marketplace where local businesses and
                people trade skills, equipment, and services for mutual growth.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/browse">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto shadow-md hover:shadow-lg"
                  >
                    I&apos;m looking for something
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto shadow-md hover:shadow-lg"
                  >
                    I have something to offer
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl p-6 border bg-gradient-to-b from-primary/15 to-accent/15 ring-1 ring-primary/10 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  title="Sustainable"
                  subtitle="Reduce waste by reusing"
                />
                <FeatureCard title="Local-first" subtitle="Connect in Leeds" />
                <FeatureCard
                  title="Smart matches"
                  subtitle="Find perfect swaps"
                />
                <FeatureCard
                  title="Trust & reviews"
                  subtitle="Build reputation"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-xl p-6 border text-center bg-gradient-to-r from-primary/15 via-surface to-accent/15 shadow-md">
              <h2 className="text-2xl font-semibold text-primary-content">
                Ready to start swapping?
              </h2>
              <p className="mt-2 text-secondary-content">
                Create a listing or browse what the community needs.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/browse">
                  <Button
                    variant="default"
                    size="lg"
                    className="shadow-md hover:shadow-lg"
                  >
                    Browse listings
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="default"
                    size="lg"
                    className="shadow-md hover:shadow-lg"
                  >
                    Create a listing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-lg border bg-surface/80 backdrop-blur p-4 transition hover:shadow-md hover:-translate-y-0.5 border-primary/10 hover:border-primary/30 shadow-sm">
      <p className="text-primary-content font-semibold">{title}</p>
      <p className="text-muted-content text-sm">{subtitle}</p>
    </div>
  );
}
