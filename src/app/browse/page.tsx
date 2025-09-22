"use client";

import { useState } from "react";
import Image from "next/image";
import { RefreshCcwDot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "Web Design Services",
    description:
      "Professional web design and development services for small businesses",
    category: "design",
    userId: "user1",
    imageUrl: "/replace-this.jpg",
  },
  {
    id: 2,
    title: "Marketing Consultation",
    description: "Expert marketing advice for startups and growing businesses",
    category: "marketing",
    userId: "user2",
    imageUrl: "/replace-this.jpg",
  },
  {
    id: 3,
    title: "Office Space",
    description:
      "Shared office space available for freelancers and small teams",
    category: "workspace",
    userId: "user3",
    imageUrl: "/replace-this.jpg",
  },
  {
    id: 4,
    title: "Software Development",
    description:
      "Full-stack development services for web and mobile applications",
    category: "development",
    userId: "user4",
    imageUrl: "/replace-this.jpg",
  },
  {
    id: 5,
    title: "Business Consulting",
    description: "Strategic business consulting for growth and optimization",
    category: "consulting",
    userId: "user5",
    imageUrl: "/replace-this.jpg",
  },
];

// Mock recommended offers based on user preferences
const mockRecommendedOffers = [
  {
    id: 1,
    title: "Web Design Services",
    description:
      "Professional web design and development services for small businesses",
    category: "design",
    userId: "user1",
    imageUrl: "/replace-this.jpg",
  },
  {
    id: 4,
    title: "Software Development",
    description:
      "Full-stack development services for web and mobile applications",
    category: "development",
    userId: "user4",
    imageUrl: "/replace-this.jpg",
  },
];

// Mock categories
const categories = [
  { value: "all", label: "All Categories" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "marketing", label: "Marketing" },
  { value: "consulting", label: "Consulting" },
  { value: "workspace", label: "Workspace" },
];

export default function BrowseListingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredListings =
    selectedCategory === "all"
      ? mockListings
      : mockListings.filter((listing) => listing.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-surface p-4">
      <div className="flex items-center mb-6">
        <RefreshCcwDot className="h-8 w-8 text-primary" />
        <span className="ml-2 text-2xl font-bold font-brand text-primary">
          swapable
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-content mb-2">
          Browse Listings
        </h1>
        <p className="text-muted-content">
          Find what you need from local businesses
        </p>
      </div>

      {/* Recommended Offers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary-content mb-4">
          Recommended Offers
        </h2>
        {mockRecommendedOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRecommendedOffers.map((offer) => (
              <Card
                key={offer.id}
                className="bg-surface-secondary border-input"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={offer.imageUrl}
                    alt={offer.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-primary-content">
                    {offer.title}
                  </CardTitle>
                  <CardDescription className="text-secondary-content">
                    {offer.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      {offer.category.charAt(0).toUpperCase() +
                        offer.category.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-content">
            No recommended offers at this time
          </p>
        )}
      </div>

      {/* Category Filter Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-content mb-2">
          Filter by category
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="bg-surface-secondary border-input">
            <div className="relative h-48 w-full">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-primary-content">
                {listing.title}
              </CardTitle>
              <CardDescription className="text-secondary-content">
                {listing.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  {listing.category.charAt(0).toUpperCase() +
                    listing.category.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredListings.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-content">
            No listings match your selected category
          </p>
        </div>
      )}
    </div>
  );
}
