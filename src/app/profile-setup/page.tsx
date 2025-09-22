"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Mock tags data
const mockTags = [
  { id: 1, name: "Web Design" },
  { id: 2, name: "Software Development" },
  { id: 3, name: "Marketing" },
  { id: 4, name: "Consulting" },
  { id: 5, name: "Photography" },
  { id: 6, name: "Videography" },
  { id: 7, name: "Content Writing" },
  { id: 8, name: "Social Media Management" },
  { id: 9, name: "3D Printing" },
  { id: 10, name: "Equipment Rental" },
  { id: 11, name: "Legal Services" },
  { id: 12, name: "Accounting" },
];

export default function ProfileSetupPage() {
  const [interestedIn, setInterestedIn] = useState<number[]>([]);
  const [canOffer, setCanOffer] = useState<number[]>([]);
  const [location, setLocation] = useState<string>("");

  const handleInterestedInChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setInterestedIn([...interestedIn, tagId]);
    } else {
      setInterestedIn(interestedIn.filter((id) => id !== tagId));
    }
  };

  const handleCanOfferChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setCanOffer([...canOffer, tagId]);
    } else {
      setCanOffer(canOffer.filter((id) => id !== tagId));
    }
  };

  const handleSubmit = () => {
    // In a real app, this would save the profile data to the database
    console.log("Profile data:", { interestedIn, canOffer, location });
    // Redirect to home page or dashboard after saving
  };

  return (
    <div className="flex flex-col bg-surface p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2">
          Profile Setup
        </h1>
        <p className="text-muted-content">
          Tell us what you&apos;re interested in and what you can offer
        </p>
      </div>

      {/* Location Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-secondary-content mb-2">
          Your Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location"
          className="w-full p-3 rounded-lg border border-input bg-background text-primary-content"
        />
      </div>

      {/* Interested In Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary-content mb-4">
          I&apos;m interested in
        </h2>
        <div className="space-y-3">
          {mockTags.map((tag) => (
            <div
              key={`interested-${tag.id}`}
              className="flex items-center space-x-3"
            >
              <Checkbox
                id={`interested-${tag.id}`}
                checked={interestedIn.includes(tag.id)}
                onCheckedChange={(checked) =>
                  handleInterestedInChange(tag.id, !!checked)
                }
              />
              <label
                htmlFor={`interested-${tag.id}`}
                className="text-sm font-medium text-primary-content leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Can Offer Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary-content mb-4">
          I can offer
        </h2>
        <div className="space-y-3">
          {mockTags.map((tag) => (
            <div
              key={`offer-${tag.id}`}
              className="flex items-center space-x-3"
            >
              <Checkbox
                id={`offer-${tag.id}`}
                checked={canOffer.includes(tag.id)}
                onCheckedChange={(checked) =>
                  handleCanOfferChange(tag.id, !!checked)
                }
              />
              <label
                htmlFor={`offer-${tag.id}`}
                className="text-sm font-medium text-primary-content leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button className="w-full py-6 body-large" onClick={handleSubmit}>
        Complete Profile
      </Button>
    </div>
  );
}
