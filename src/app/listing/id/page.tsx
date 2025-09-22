"use client";

import { useState } from "react";
import { RefreshCcwDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Mock data for a listing
const mockListing = {
  id: 1,
  title: "Web Design Services",
  description: "Professional web design and development services for small businesses. I can help you create a modern, responsive website that will help your business stand out online. Services include UI/UX design, front-end development, and consultation.",
  category: "design",
  userId: "user1",
  active: true,
  repeatable: true,
  imageUrl: null
};

// Mock user's items they can offer in return
const userItems = [
  { id: 2, title: "Marketing Consultation" },
  { id: 3, title: "Office Space" },
  { id: 4, title: "Software Development" }
];

export default function ListingPage() {
  const [selectedItem, setSelectedItem] = useState<string>("");

  const handleMakeOffer = () => {
    if (!selectedItem) {
      alert("Please select an item to offer");
      return;
    }
    // In a real app, this would create an offer in the database
    console.log("Making offer:", { listingId: mockListing.id, offeredItemId: selectedItem });
    alert("Offer submitted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface p-4">
      <div className="flex items-center mb-6">
        <RefreshCcwDot className="h-8 w-8 text-primary" />
        <span className="ml-2 text-2xl font-bold font-brand text-primary">swapable</span>
      </div>

      <div className="mb-6">
        <Button variant="outline" className="mb-4" onClick={() => window.history.back()}>
          ← Back to listings
        </Button>
      </div>

      {/* Listing Details */}
      <Card className="bg-surface-secondary border-input mb-8">
        <CardHeader>
          <CardTitle className="text-primary-content">{mockListing.title}</CardTitle>
          <CardDescription className="text-secondary-content">
            {mockListing.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              {mockListing.category.charAt(0).toUpperCase() + mockListing.category.slice(1)}
            </span>
            <span className="ml-2 text-xs text-muted-content">
              {mockListing.repeatable ? "Repeatable" : "One-off"}
            </span>
          </div>
          <p className="text-sm text-muted-content">Posted by: {mockListing.userId}</p>
        </CardContent>
      </Card>

      {/* Make Offer Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary-content mb-4">Make an Offer</h2>
        <p className="text-secondary-content mb-4">
          Select one of your items to offer in exchange, or create a new item to offer.
        </p>

        {/* Select Item to Offer */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Select an item to offer
          </label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select one of your items" />
            </SelectTrigger>
            <SelectContent>
              {userItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Offer Buttons */}
        <div className="space-y-4">
          <Button className="w-full py-6 body-large" onClick={handleMakeOffer}>
            Make Offer
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 body-large"
            onClick={() => window.location.href = "/create-listing"}
          >
            Create New Item to Offer
          </Button>
        </div>
      </div>
    </div>
  );
}