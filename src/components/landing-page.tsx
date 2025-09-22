"use client";

import { RefreshCcwDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-surface p-4">
      <div className="flex flex-col items-center justify-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <RefreshCcwDot className="h-16 w-16 text-primary" />
          <span className="ml-3 text-4xl font-bold font-brand text-primary">
            swapable
          </span>
        </div>

        {/* Tagline */}
        <p className="text-center text-secondary-content body-large">
          Swap skills or products, share expertise, and grow together.
        </p>

        {/* Buttons */}
        <div className="flex flex-col space-y-4 w-full">
          <Link href="/browse" passHref>
            <Button className="w-full py-6 body-large" variant="default">
              I'm looking for something
            </Button>
          </Link>

          <Link href="/create-listing" passHref>
            <Button className="w-full py-6 body-large" variant="outline">
              I have something to offer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
