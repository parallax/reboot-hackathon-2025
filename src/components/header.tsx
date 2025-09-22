"use client";
import { Search, Menu, RefreshCcwDot, Plus } from "lucide-react";
import Link from "next/link";

import { DebugMenu } from "@/components/debug-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type HeaderProps = {
  debugEnabled?: boolean;
};

export function Header({ debugEnabled = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border backdrop-blur-sm bg-surface/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/"
            className="flex items-center md:static absolute left-1/2 transform md:transform-none -translate-x-1/2 md:translate-x-0"
          >
            <div className="w-8 h-8 bg-primary dark:bg-emerald-500 rounded-lg flex items-center justify-center sm:flex hidden">
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
              <Link href="/create-listing">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-emerald-700 text-white hidden sm:flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Listing
                </Button>
              </Link>

              <Link href="/create-listing" className="sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>

              {/* Auth: Clerk user menu */}
              <div className="ml-2">
                <SignedIn>
                  <UserButton userProfileUrl="/profile-setup" appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}>
                    <UserButton.MenuItems>
                      <UserButton.Link label="Profile settings" href="/profile-setup" />
                      <UserButton.Action label="Sign out" action="signOut" />
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="redirect">
                    <Button variant="outline" size="sm" className="ml-1">Sign in</Button>
                  </SignInButton>
                </SignedOut>
              </div>

              {debugEnabled ? <DebugMenu /> : null}
            </div>
          </div>
        </div>

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
