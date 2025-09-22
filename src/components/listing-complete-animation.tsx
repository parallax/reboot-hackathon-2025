"use client";

import { RefreshCcwDot } from "lucide-react";
import { CheckCircle } from "lucide-react";

export default function ListingCompleteAnimation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <RefreshCcwDot className="h-16 w-16 text-primary animate-pulse" />
          <CheckCircle className="h-8 w-8 text-green-500 absolute -bottom-2 -right-2 bg-surface rounded-full" />
        </div>
        <h2 className="text-2xl font-bold font-brand text-primary-content mt-4">Listing Created!</h2>
        <p className="text-muted-content mt-2">Your offer has been successfully added to the community</p>
        <div className="mt-6 flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}