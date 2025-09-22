"use client";

import { useState, useTransition } from "react";
import { Bug, Loader2, RotateCcw } from "lucide-react";

import { clearOnboardingStatus } from "@/actions/debug";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type StatusMessage =
  | { variant: "success"; message: string }
  | { variant: "error"; message: string };

export function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClearOnboarding = () => {
    setStatus(null);

    startTransition(async () => {
      const result = await clearOnboardingStatus();

      if (result.success) {
        setStatus({
          variant: "success",
          message:
            "Onboarding status cleared. Next auth page will redirect to setup.",
        });
      } else {
        setStatus({
          variant: "error",
          message: result.error,
        });
      }
    });
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setStatus(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2 gap-2">
          <Bug className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <div className="text-sm font-semibold">Debug tools</div>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          disabled={isPending}
          onClick={handleClearOnboarding}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Clear onboarding status
        </Button>
        {status ? (
          <p
            className={`text-xs leading-snug ${
              status.variant === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
