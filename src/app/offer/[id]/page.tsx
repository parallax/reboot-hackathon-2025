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

// Mock offer history data
const mockOfferHistory = [
  {
    id: 1,
    itemId: 1,
    offeredItemId: 2,
    createdAt: new Date("2025-09-20"),
    acceptedAt: null,
    rejectedAt: null,
    expiry: new Date("2025-09-27"),
    status: "pending"
  },
  {
    id: 2,
    itemId: 1,
    offeredItemId: 3,
    createdAt: new Date("2025-09-18"),
    acceptedAt: new Date("2025-09-19"),
    rejectedAt: null,
    expiry: null,
    status: "accepted"
  }
];

// Mock listing data
const mockListings = [
  {
    id: 1,
    title: "Web Design Services",
    description: "Professional web design and development services for small businesses",
    category: "design",
    userId: "user1"
  },
  {
    id: 2,
    title: "Marketing Consultation",
    description: "Expert marketing advice for startups and growing businesses",
    category: "marketing",
    userId: "user2"
  },
  {
    id: 3,
    title: "Office Space",
    description: "Shared office space available for freelancers and small teams",
    category: "workspace",
    userId: "user3"
  }
];

export default function OfferHistoryPage() {
  const [newOffer, setNewOffer] = useState<string>("");

  const handleAccept = (offerId: number) => {
    // In a real app, this would update the offer status in the database
    console.log("Accepting offer:", offerId);
    alert("Offer accepted!");
  };

  const handleReject = (offerId: number) => {
    // In a real app, this would update the offer status in the database
    console.log("Rejecting offer:", offerId);
    alert("Offer rejected!");
  };

  const handleSubmitCounterOffer = (originalOfferId: number) => {
    if (!newOffer.trim()) {
      alert("Please enter a counter offer");
      return;
    }
    // In a real app, this would create a new offer history record
    console.log("Submitting counter offer:", { originalOfferId, newOffer });
    alert("Counter offer submitted!");
    setNewOffer("");
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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2">Offer History</h1>
        <p className="text-muted-content">Manage and track your swap offers</p>
      </div>

      {/* Offer History List */}
      <div className="space-y-6">
        {mockOfferHistory.map((offer) => {
          const item = mockListings.find(l => l.id === offer.itemId);
          const offeredItem = mockListings.find(l => l.id === offer.offeredItemId);

          return (
            <Card key={offer.id} className="bg-surface-secondary border-input">
              <CardHeader>
                <CardTitle className="text-primary-content">
                  Offer for {item?.title}
                </CardTitle>
                <CardDescription className="text-secondary-content">
                  You offered: {offeredItem?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-content">
                    Created: {offer.createdAt.toLocaleDateString()}
                  </p>
                  {offer.expiry && (
                    <p className="text-sm text-muted-content">
                      Expires: {offer.expiry.toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm font-medium mt-2">
                    Status:
                    <span className={`ml-2 ${
                      offer.status === "accepted" ? "text-green-600" :
                      offer.status === "rejected" ? "text-red-600" :
                      "text-yellow-600"
                    }`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </p>
                </div>

                {offer.status === "pending" && (
                  <div className="flex space-x-4">
                    <Button onClick={() => handleAccept(offer.id)} className="flex-1">
                      Accept
                    </Button>
                    <Button variant="outline" onClick={() => handleReject(offer.id)} className="flex-1">
                      Reject
                    </Button>
                  </div>
                )}

                {offer.status === "accepted" && (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-4">Offer Accepted!</p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = "https://linkedin.com"}
                      className="w-full"
                    >
                      View LinkedIn Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Counter Offer Section */}
        <Card className="bg-surface-secondary border-input">
          <CardHeader>
            <CardTitle className="text-primary-content">Submit Counter Offer</CardTitle>
            <CardDescription className="text-secondary-content">
              Propose a different item in exchange
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-content mb-2">
                Your counter offer
              </label>
              <input
                type="text"
                value={newOffer}
                onChange={(e) => setNewOffer(e.target.value)}
                placeholder="What would you like to offer instead?"
                className="w-full p-3 rounded-lg border border-input bg-background text-primary-content"
              />
            </div>

            <Button
              className="w-full"
              onClick={() => handleSubmitCounterOffer(mockOfferHistory[0].id)}
            >
              Submit Counter Offer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}