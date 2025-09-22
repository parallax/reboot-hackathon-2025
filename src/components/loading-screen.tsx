"use client";

import { RefreshCcwDot } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">
      <div className="flex flex-col items-center">
        <RefreshCcwDot className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold font-brand text-primary-content mt-4">Creating your listing...</h2>
        <p className="text-muted-content mt-2">Please wait while we set up your offer</p>
      </div>
    </div>
  );
}