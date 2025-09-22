"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LandingPage } from "@/components/landing-page";
import { MarketingLanding } from "@/components/marketing-landing";

export function HomeContent() {
  return (
    <>
      <SignedIn>
        <LandingPage />
      </SignedIn>
      <SignedOut>
        <MarketingLanding />
      </SignedOut>
    </>
  );
}


