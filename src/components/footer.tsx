import { RefreshCcwDot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center">
              <RefreshCcwDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-emerald-600 dark:text-white">
              swapable
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-pretty max-w-md text-right">
            Connecting businesses across Leeds to trade skills, services and
            resources effortlessly. Share more, swap smarter.
          </p>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 swapable. All rights reserved. |
            <a href="#" className="hover:text-foreground ml-1">
              Privacy Policy
            </a>{" "}
            |
            <a href="#" className="hover:text-foreground ml-1">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
