"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
import { sendOfferEmail } from "@/actions/send-offer-email";
import { createOffer } from "@/actions/offer-actions";

interface ItemData {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
  active: boolean;
  userId: string;
  userName: string;
  userLocation: string;
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
  const { user } = useUser();
  const [item, setItem] = useState<ItemData | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<boolean>(false);

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

        setItem(itemResult.data as ItemData);

        // Fetch user's items for offering
        const userItemsResult = await getUserListings();
        if (userItemsResult.success) {
          setUserItems((userItemsResult.data as unknown as UserItem[]) || []);
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

  const handleMakeOffer = async () => {
    if (!item) {
      alert("Cannot make an offer on an item that doesn't exist");
      return;
    }

    if (!selectedItem) {
      alert("Please select an item to offer");
      return;
    }

    if (!user?.id) {
      alert("You must be logged in to make an offer");
      return;
    }

    try {
      setIsSubmittingOffer(true);
      
      // First, create the offer in the database
      const offerResult = await createOffer({
        itemId: item.id,
        offeredItemId: parseInt(selectedItem),
        offererUserId: user.id,
        expiryDays: 7, // Offer expires in 7 days
      });

      if (!offerResult.success) {
        alert(`Failed to create offer: ${offerResult.error}`);
        return;
      }

      // Then send email notification to the item owner
      const emailResult = await sendOfferEmail({
        itemId: item.id,
        offeredItemId: parseInt(selectedItem),
        offerId: offerResult.data.offerId,
        offererUserId: user.id,
      });

      if (emailResult.success) {
        setShowSuccessMessage(true);
        // Hide the success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } else {
        // Offer was created but email failed - still show success but warn about email
        setShowSuccessMessage(true);
        console.warn("Offer created but email notification failed:", emailResult.error);
        // Hide the success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error making offer:", error);
      alert("Failed to submit offer. Please try again.");
    } finally {
      setIsSubmittingOffer(false);
    }
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
      <Button
        variant="outline"
        className="mb-6 w-fit"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to listings
      </Button>

      {/* Success message when redirected from create listing or offer submitted */}
      {showSuccessMessage && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 mb-6">
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
            <p className="text-emerald-800 dark:text-emerald-200">
              {searchParams.get("new") === "true" 
                ? "Your listing has been successfully created!"
                : "Your offer has been created and submitted successfully! The item owner will be notified by email."
              }
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
                Posted by: {item.userName} {item.userLocation ? `from ${item.userLocation}` : ""}
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
                disabled={!selectedItem || selectedItem === "none" || isSubmittingOffer}
              >
                {isSubmittingOffer ? (
                  <>
                    <RefreshCcwDot className="h-4 w-4 mr-2 animate-spin" />
                    Sending Offer...
                  </>
                ) : (
                  "Make Offer"
                )}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => (window.location.href = "/create-item")}
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
