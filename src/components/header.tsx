"use client";
import {
  Search,
  Menu,
  RefreshCcwDot,
  Plus,
  X,
  RefreshCcwDotIcon,
  Loader2,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DebugMenu } from "@/components/debug-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useDebounce } from "@/hooks/use-debounce";
import { searchItemsAction } from "@/lib/search-actions";

type HeaderProps = {
  debugEnabled?: boolean;
};

export function Header({ debugEnabled = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{id: number, title: string, description: string, similarity: number}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchItemsAction(debouncedSearchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleResultClick = (itemId: number) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(`/items/${itemId}`);
  };


  // Add click outside effect
  useEffect(() => {
    const handleClickOutsideEvent = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('click', handleClickOutsideEvent);
      return () => document.removeEventListener('click', handleClickOutsideEvent);
    }
  }, [showResults]);

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
              <div className="relative w-full search-container">
                {isSearching ? (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                )}
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm"
                />

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item.id)}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Similarity: {(item.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      No items found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation icons */}
            <div className="flex items-center">
              {/* Desktop navigation links */}
              <SignedIn>
                <Link href="/my-listings" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2 text-primary-content hover:bg-surface-secondary"
                  >
                    My Listings
                  </Button>
                </Link>
              </SignedIn>
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
              <SignedIn>
                <Link
                  href="/my-listings"
                  className="flex items-center gap-3 px-3 py-2 text-primary-content hover:bg-surface rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardList className="h-4 w-4" />
                  My Listings
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
          <div className="relative search-container">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            )}
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm"
            />

            {/* Mobile Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleResultClick(item.id)}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {item.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Similarity: {(item.similarity * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  No items found for &ldquo;{searchQuery}&rdquo;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
