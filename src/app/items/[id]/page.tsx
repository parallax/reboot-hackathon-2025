"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCcwDot, CheckCircle, User, Tag, Calendar } from "lucide-react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { getItemById, getUserListings } from "@/lib/listings-actions";

interface ItemData {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
  active: boolean;
  userId: string;
  tags: Array<{ id: number; name: string }>;
}

interface UserItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
}

export default function ItemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [item, setItem] = useState<ItemData | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Get item ID from URL params
  const itemId = parseInt(params.id as string);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the item data
        const itemResult = await getItemById(itemId);

        if (!itemResult.success) {
          setError(itemResult.error || "Item not found");
          return;
        }

        setItem(itemResult.data!);

        // Fetch user's items for offering
        const userItemsResult = await getUserListings();
        if (userItemsResult.success) {
          setUserItems(userItemsResult.data || []);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchData();
    }
  }, [itemId]);

  const handleMakeOffer = () => {
    if (!item) {
      alert("Cannot make an offer on an item that doesn't exist");
      return;
    }

    if (!selectedItem) {
      alert("Please select an item to offer");
      return;
    }

    // In a real app, this would create an offer in the database
    console.log("Making offer:", {
      itemId: item.id,
      offeredItemId: selectedItem,
    });
    alert("Offer submitted successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4">
        <div className="flex flex-col items-center">
          <RefreshCcwDot className="h-16 w-16 text-primary animate-spin" />
          <h2 className="text-2xl font-bold font-brand text-primary-content mt-4">
            Loading item...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col min-h-screen bg-surface p-4">
        <div className="flex items-center mb-6">
          <RefreshCcwDot className="h-8 w-8 text-primary" />
          <span className="ml-2 text-2xl font-bold font-brand text-primary">swapable</span>
        </div>

        <Button
          variant="outline"
          className="mb-6 w-fit"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to listings
        </Button>

        <Card className="bg-surface-secondary border-input">
          <CardHeader>
            <CardTitle className="text-primary-content">
              Item Not Found
            </CardTitle>
            <CardDescription className="text-secondary-content">
              {error || "The item you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <RefreshCcwDot className="h-8 w-8 text-primary" />
        <span className="ml-2 text-2xl font-bold font-brand text-primary">swapable</span>
      </div>

      <Button
        variant="outline"
        className="mb-6 w-fit"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to listings
      </Button>

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

      {/* Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Section */}
        <div className="space-y-4">
          {item.imageUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square w-full bg-surface-secondary border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <RefreshCcwDot className="h-16 w-16 text-muted-content mx-auto mb-4" />
                <p className="text-muted-content">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-content mb-2">
              {item.title}
            </h1>
            <p className="text-lg text-secondary-content leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-content" />
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="bg-primary/10 text-primary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Type */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-content" />
              <Badge variant={item.repeatable ? "default" : "outline"}>
                {item.repeatable ? "Repeatable" : "One-off"}
              </Badge>
            </div>

            {/* Owner */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-content" />
              <span className="text-sm text-muted-content">
                Posted by: {item.userId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Make Offer Section */}
      {item.active && (
        <Card className="bg-surface-secondary border-input">
          <CardHeader>
            <CardTitle className="text-primary-content flex items-center gap-2">
              <RefreshCcwDot className="h-5 w-5 text-primary" />
              Make an Offer
            </CardTitle>
            <CardDescription className="text-secondary-content">
              Select one of your items to offer in exchange, or create a new item to offer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Item to Offer */}
            <div>
              <label className="block text-sm font-medium text-secondary-content mb-2">
                Select an item to offer
              </label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose from your items" />
                </SelectTrigger>
                <SelectContent>
                  {userItems.map((userItem) => (
                    <SelectItem key={userItem.id} value={userItem.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{userItem.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {userItem.repeatable ? "Repeatable" : "One-off"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {userItems.length === 0 && (
                    <SelectItem value="none" disabled>
                      No items available - create one first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Offer Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={handleMakeOffer}
                disabled={!selectedItem || selectedItem === "none"}
              >
                Make Offer
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => (window.location.href = "/create-listing")}
              >
                Create New Item to Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!item.active && (
        <Card className="bg-surface-secondary border-input">
          <CardContent className="p-6 text-center">
            <p className="text-muted-content">
              This item is no longer available for offers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
