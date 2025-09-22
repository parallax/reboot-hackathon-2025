import { RefreshCcwDot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted mt-12 md:mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-8 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center">
              <RefreshCcwDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-emerald-600 dark:text-white">
              swapable
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-pretty md:max-w-md md:text-right">
            Connecting businesses across Leeds to trade skills, services and
            resources effortlessly. Share more, swap smarter.
          </p>
        </div>

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8">
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-center">
            <span className="text-muted-foreground text-sm">
              © 2025 swapable. All rights reserved.
            </span>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
