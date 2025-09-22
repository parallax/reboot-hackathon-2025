"use server";

import { db } from "@/db/index";
import { items, itemTags } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export async function createListing(formData: {
  title: string;
  description: string;
  imageUrl: string;
  tagIds: number[];
  repeatable: boolean;
}) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to create a listing",
      };
    }

    // Validate required fields
    if (!formData.title.trim()) {
      return {
        success: false,
        error: "Title is required",
      };
    }

    if (!formData.description.trim()) {
      return {
        success: false,
        error: "Description is required",
      };
    }

    if (!formData.tagIds || formData.tagIds.length === 0) {
      return {
        success: false,
        error: "At least one category is required",
      };
    }

    // Create the listing in the database
    const [newItem] = await db
      .insert(items)
      .values({
        userId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl || null,
        repeatable: formData.repeatable,
        active: true, // New listings are active by default
      })
      .returning();

    // Create multiple item-tag relationships
    const itemTagValues = formData.tagIds.map((tagId) => ({
      itemId: newItem.id,
      tagId: tagId,
    }));

    await db.insert(itemTags).values(itemTagValues);

    // Revalidate the listings page to show the new listing
    revalidatePath("/");
    revalidatePath("/listings");

    return {
      success: true,
      data: {
        id: newItem.id,
        title: newItem.title,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
        repeatable: newItem.repeatable,
      },
    };
  } catch (error) {
    console.error("Error creating listing:", error);
    return {
      success: false,
      error: "Failed to create listing. Please try again.",
    };
  }
}

export async function getUserListings(userId?: string) {
  try {
    const { userId: currentUserId } = await auth();
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userListings = await db
      .select({
        id: items.id,
        title: items.title,
        description: items.description,
        imageUrl: items.imageUrl,
        repeatable: items.repeatable,
        active: items.active,
        userId: items.userId,
      })
      .from(items)
      .where(eq(items.userId, targetUserId))
      .orderBy(desc(items.id));

    return {
      success: true,
      data: userListings,
    };
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return {
      success: false,
      error: "Failed to fetch listings",
    };
  }
}

export async function getActiveListings({
  selectedCategories,
}: {
  selectedCategories: string[];
}) {
  // Get all active items with their tags
  const allActiveItems = await db.query.items.findMany({
    with: {
      itemTags: {
        with: {
          tag: true,
          item: true,
        },
      },
    },
    where: eq(items.active, true),
    orderBy: desc(items.id),
  });

  // Filter items that have at least one tag matching selected categories
  const selectedCategoryIds = selectedCategories.map(Number);
  return allActiveItems.filter((item) =>
    item.itemTags?.some(
      (tagItem) => tagItem.tag && selectedCategoryIds.includes(tagItem.tag.id)
    )
  );
}

export async function getItemById(itemId: number) {
  try {
    // Get the item with its tags and user preferences
    const itemWithTags = await db.query.items.findMany({
      with: {
        itemTags: {
          with: {
            tag: true,
            item: true,
          },
        },
        userPreferences: true,
      },
      where: eq(items.id, itemId),
    });

    if (itemWithTags.length === 0) {
      return {
        success: false,
        error: "Item not found",
      };
    }

    // Transform the data to group tags
    const item = itemWithTags[0];
    const tags = itemWithTags
      .flatMap((row) => row.itemTags || [])
      .filter((tagItem) => tagItem.tag?.id !== null)
      .map((tagItem) => ({
        id: tagItem.tag?.id || null,
        name: tagItem.tag?.name || "",
      }));

    // Get user name from Clerk for the item creator
    let userName = "Unknown User";
    try {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const user = await clerkClient.users.getUser(item.userId);

      if (user) {
        userName = user.firstName ?? "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user from Clerk:", error);
      // Fallback to showing a shortened userId if we can't get the user info
      userName = `User ${item.userId.slice(0, 8)}...`;
    }

    return {
      success: true,
      data: {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        repeatable: item.repeatable,
        active: item.active,
        userId: item.userId,
        userName: userName,
        userLocation: item.userPreferences?.location,
        tags: tags,
      },
    };
  } catch (error) {
    console.error("Error fetching item:", error);
    return {
      success: false,
      error: "Failed to fetch item",
    };
  }
}

// Alias for createListing to match the UI naming
export const createItem = createListing;
