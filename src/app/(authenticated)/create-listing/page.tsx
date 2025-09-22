"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCcwDot, CheckCircle, Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTags } from '@/lib/tags-utils';
import { createListing } from '@/lib/listings-actions';

export default function CreateListingPage() {
  const [stage, setStage] = useState<"form" | "loading" | "complete">("form");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [repeatable, setRepeatable] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<Array<{id: number, name: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getTags();
      setAvailableTags(tags);
    };

    fetchTags();
  }, []);

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageUrl(""); // Clear manual URL when file is selected

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return "";

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/blob', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
      return "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!selectedTagId) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      // Move to loading stage
      setStage("loading");

      // Upload image if file is selected
      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        uploadedImageUrl = await handleImageUpload();
        if (!uploadedImageUrl) {
          throw new Error("Image upload failed");
        }
      }

      // Create the listing in the database
      const result = await createListing({
        title,
        description,
        imageUrl: uploadedImageUrl,
        tagId: parseInt(selectedTagId),
        repeatable,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create listing");
      }

      // Move to complete stage
      setStage("complete");

      // After 2 seconds, redirect to the created item page
      setTimeout(() => {
        window.location.href = '/items/' + result.data!.id + '?new=true';
      }, 2000);

    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create listing. Please try again.");
      setStage("form");
    }
  };

  // Render different stages
  if (stage === "loading") {
    return (
      <div className="flex flex-col items-center justify-center bg-surface p-4">
        <div className="flex flex-col items-center">
          <RefreshCcwDot className="h-16 w-16 text-primary animate-spin" />
          <h2 className="text-2xl font-bold font-brand text-primary-content mt-4">
            Creating your listing...
          </h2>
          <p className="text-muted-content mt-2">
            Please wait while we set up your offer
          </p>
        </div>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="flex flex-col items-center justify-center bg-surface p-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <RefreshCcwDot className="h-16 w-16 text-primary animate-pulse" />
            <CheckCircle className="h-8 w-8 text-green-500 absolute -bottom-2 -right-2 bg-surface rounded-full" />
          </div>
          <h2 className="text-2xl font-bold font-brand text-primary-content mt-4">
            Listing Created!
          </h2>
          <p className="text-muted-content mt-2">
            Your offer has been successfully added to the community
          </p>
          <div className="mt-6 flex space-x-2">
            <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
            <div
              className="h-3 w-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="h-3 w-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-content mb-2">
          Create Listing
        </h1>
        <p className="text-muted-content">
          Share what you can offer with the community
        </p>
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
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
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
          {errors.description && (
            <p className="text-destructive text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Picture
          </label>

          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
              ${isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
              }
              ${imagePreview ? 'pb-2' : ''}
            `}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Preview Image */}
            {imagePreview && (
              <div className="relative mb-4">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImage}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-surface/80 hover:bg-surface"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Content */}
            {!imagePreview && (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <ImageIcon className="w-full h-full" />
                </div>
                <div className="mb-4">
                  <p className="text-primary-content font-medium">
                    Drop your image here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-muted-content text-sm mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose File</span>
                </Button>
              </div>
            )}

            {/* Selected File Info */}
            {imageFile && (
              <div className="text-center">
                <p className="text-sm text-muted-content mb-2">
                  Selected: {imageFile.name}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>

          {/* Alternative URL Input */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-muted-content">Or</span>
              </div>
            </div>
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value) {
                  // Clear file selection if URL is provided
                  setImageFile(null);
                  setImagePreview("");
                }
              }}
              placeholder="Enter image URL"
              className="mt-3"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-secondary-content mb-2">
            Category
          </label>
          <Select value={selectedTagId} onValueChange={setSelectedTagId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id.toString()}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-destructive text-sm mt-1">{errors.category}</p>
          )}
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

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full py-6 body-large">
          Create Listing
        </Button>
      </form>
    </div>
  );
}
