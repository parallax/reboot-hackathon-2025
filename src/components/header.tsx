"use client";
import {
  Search,
  Menu,
  RefreshCcwDot,
  Plus,
  X,
  RefreshCcwDotIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DebugMenu } from "@/components/debug-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type HeaderProps = {
  debugEnabled?: boolean;
};

export function Header({ debugEnabled = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border backdrop-blur-sm transition-all duration-200 ${
        isScrolled ? "bg-white/95 dark:bg-gray-900/95" : "bg-surface/95"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <Link
            href="/"
            className="flex items-center md:static absolute left-1/2 transform md:transform-none -translate-x-1/2 md:translate-x-0"
          >
            <div className="w-8 h-8 bg-primary dark:bg-emerald-500 rounded-lg items-center justify-center sm:flex hidden">
              <RefreshCcwDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-brand font-bold text-lg text-primary dark:text-white pl-2">
              swapable
            </span>
          </Link>

          <div className="flex-1 flex justify-end">
            {/* Search bar - hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search listings..."
                  className="pl-10 bg-surface-secondary border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Navigation icons */}
            <div className="flex items-center">
              {/* Desktop Offers Link */}
              <SignedIn>
                <Link href="/offers" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2 text-primary-content hover:bg-surface-secondary"
                  >
                    Offers
                  </Button>
                </Link>
              </SignedIn>

              <SignedIn>
                <Link href="/create-item">
                  <Button
                    variant="default"
                    size="sm"
                    className="mr-2 bg-primary hover:bg-emerald-700 text-white hidden sm:flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                </Link>

                <Link href="/create-item" className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>

              {/* Auth: Clerk user menu */}
              <div className="ml-2 flex items-center">
                <SignedIn>
                  <UserButton
                    userProfileUrl="/profile"
                    appearance={{
                      elements: { userButtonAvatarBox: "h-8 w-8" },
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="redirect">
                    <Button variant="outline" size="sm" className="ml-1">
                      Sign in
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>

              {debugEnabled ? <DebugMenu /> : null}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-secondary">
            <div className="px-4 py-4 space-y-3">
              <SignedIn>
                <Link
                  href="/offers"
                  className="flex items-center gap-3 px-3 py-2 text-primary-content hover:bg-surface rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RefreshCcwDotIcon className="h-4 w-4" />
                  My Offers
                </Link>
              </SignedIn>
              <Link
                href="/browse"
                className="flex items-center gap-3 px-3 py-2 text-primary-content hover:bg-surface rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Browse Listings
              </Link>
              <SignedIn>
                <Link
                  href="/create-item"
                  className="flex items-center gap-3 px-3 py-2 text-primary-content hover:bg-surface rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  Create Listing
                </Link>
              </SignedIn>
            </div>
          </div>
        )}

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search listings..."
              className="pl-10 bg-surface-secondary border-border focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
