"use client";

import { RefreshCcwDot } from "lucide-react";
import { LinkButton } from "@/components/ui/linkButton";

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">
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
          <LinkButton href="/browse" variant="default" size="lg">
            I need
          </LinkButton>

          <LinkButton href="/browse" variant="outline" size="lg">
            I want
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
