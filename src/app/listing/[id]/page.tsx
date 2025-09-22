"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "Web Design Services",
    description:
      "Professional web design and development services for small businesses. I can help you create a modern, responsive website that will help your business stand out online. Services include UI/UX design, front-end development, and consultation.",
    category: "design",
    userId: "user1",
    active: true,
    repeatable: true,
    imageUrl: null,
  },
  {
    id: 2,
    title: "Marketing Consultation",
    description:
      "Expert marketing advice for startups and growing businesses. I can help you develop a marketing strategy, create content, and improve your online presence.",
    category: "marketing",
    userId: "user2",
    active: true,
    repeatable: true,
    imageUrl: null,
  },
  {
    id: 3,
    title: "Office Space",
    description:
      "Shared office space available for freelancers and small teams. Fully equipped with desks, chairs, and high-speed internet.",
    category: "workspace",
    userId: "user3",
    active: true,
    repeatable: false,
    imageUrl: null,
  },
];

// Mock user's items they can offer in return
const userItems = [
  { id: 2, title: "Marketing Consultation" },
  { id: 3, title: "Office Space" },
  { id: 4, title: "Software Development" },
];

export default function ListingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  // Get listing ID from URL params
  const listingId = parseInt(params.id as string);

  // Find the listing based on ID
  const listing = mockListings.find((listing) => listing.id === listingId);

  useEffect(() => {
    // Check if we're redirected from create listing page
    if (searchParams.get("new") === "true") {
      setShowSuccessMessage(true);
      // Hide the success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleMakeOffer = () => {
    if (!listing) {
      alert("Cannot make an offer on a listing that doesn't exist");
      return;
    }

    if (!selectedItem) {
      alert("Please select an item to offer");
      return;
    }

    // In a real app, this would create an offer in the database
    console.log("Making offer:", {
      listingId: listing.id,
      offeredItemId: selectedItem,
    });
    alert("Offer submitted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface p-4">
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          ← Back to listings
        </Button>
      </div>

      {/* Success message when redirected from create listing */}
      {showSuccessMessage && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 mb-6">
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
            <p className="text-emerald-800 dark:text-emerald-200">
              Your listing has been successfully created!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Listing Details */}
      {listing ? (
        <Card className="bg-surface-secondary border-input mb-8">
          <CardHeader>
            <CardTitle className="text-primary-content">
              {listing.title}
            </CardTitle>
            <CardDescription className="text-secondary-content">
              {listing.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                {listing.category.charAt(0).toUpperCase() +
                  listing.category.slice(1)}
              </span>
              <span className="ml-2 text-xs text-muted-content">
                {listing.repeatable ? "Repeatable" : "One-off"}
              </span>
            </div>
            <p className="text-sm text-muted-content">
              Posted by: {listing.userId}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-surface-secondary border-input mb-8">
          <CardHeader>
            <CardTitle className="text-primary-content">
              Listing Not Found
            </CardTitle>
            <CardDescription className="text-secondary-content">
              The listing you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Make Offer Section */}
      {listing && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-content mb-4">
            Make an Offer
          </h2>
          <p className="text-secondary-content mb-4">
            Select one of your items to offer in exchange, or create a new item
            to offer.
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
            <Button
              className="w-full py-6 body-large"
              onClick={handleMakeOffer}
            >
              Make Offer
            </Button>

            <Button
              variant="outline"
              className="w-full py-6 body-large"
              onClick={() => (window.location.href = "/create-listing")}
            >
              Create New Item to Offer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
