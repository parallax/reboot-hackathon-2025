"use client";

import { useState } from "react";
import { RefreshCcwDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Mock categories for the listing
const categories = [
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "marketing", label: "Marketing" },
  { value: "consulting", label: "Consulting" },
  { value: "workspace", label: "Workspace" },
  { value: "equipment", label: "Equipment" },
  { value: "services", label: "Services" },
  { value: "products", label: "Products" }
];

export default function CreateListingPage() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [repeatable, setRepeatable] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, this would save the listing to the database
      console.log("Listing data:", { title, description, category, imageUrl, repeatable });
      // Redirect to listings page or dashboard after saving
      alert("Listing created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setImageUrl("");
      setRepeatable(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface p-4">
      <div className="flex items-center mb-6">
        <RefreshCcwDot className="h-8 w-8 text-primary" />
        <span className="ml-2 text-2xl font-bold font-brand text-primary">swapable</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2">Create Listing</h1>
        <p className="text-muted-content">Share what you can offer with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you offering?"
          />
          {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're offering in detail"
          />
          {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Picture
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Repeatable */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Listing Type
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="repeatable"
                name="repeatable"
                checked={repeatable}
                onChange={() => setRepeatable(true)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label htmlFor="repeatable" className="text-primary-content">
                Repeatable (e.g. I can teach about things)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="one-off"
                name="repeatable"
                checked={!repeatable}
                onChange={() => setRepeatable(false)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label htmlFor="one-off" className="text-primary-content">
                One-off (e.g. I have 50 chairs to get rid of)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full py-6 body-large">
          Create Listing
        </Button>
      </form>
    </div>
  );
}