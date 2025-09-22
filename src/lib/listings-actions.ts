"use server";

import { db } from "@/db/index";
import { items, itemTags, tags } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export async function createListing(formData: {
  title: string;
  description: string;
  imageUrl: string;
  tagId: number;
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

    if (!formData.tagId) {
      return {
        success: false,
        error: "Category is required",
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

    // Create the item-tag relationship
    await db.insert(itemTags).values({
      itemId: newItem.id,
      tagId: formData.tagId,
    });

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

export async function getActiveListings() {
  try {
    const activeListings = await db
      .select({
        id: items.id,
        title: items.title,
        description: items.description,
        imageUrl: items.imageUrl,
        repeatable: items.repeatable,
        userId: items.userId,
        tagId: itemTags.tagId,
        tagName: tags.name,
      })
      .from(items)
      .leftJoin(itemTags, eq(items.id, itemTags.itemId))
      .leftJoin(tags, eq(itemTags.tagId, tags.id))
      .where(eq(items.active, true))
      .orderBy(desc(items.id));

    return {
      success: true,
      data: activeListings,
    };
  } catch (error) {
    console.error("Error fetching active listings:", error);
    return {
      success: false,
      error: "Failed to fetch listings",
    };
  }
}

export async function getItemById(itemId: number) {
  try {
    // Get the item with its tags
    const itemWithTags = await db
      .select({
        id: items.id,
        title: items.title,
        description: items.description,
        imageUrl: items.imageUrl,
        repeatable: items.repeatable,
        active: items.active,
        userId: items.userId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(items)
      .leftJoin(itemTags, eq(items.id, itemTags.itemId))
      .leftJoin(tags, eq(itemTags.tagId, tags.id))
      .where(eq(items.id, itemId));

    if (itemWithTags.length === 0) {
      return {
        success: false,
        error: "Item not found",
      };
    }

    // Transform the data to group tags
    const item = itemWithTags[0];
    const itemTags_list = itemWithTags
      .filter((row) => row.tagId !== null)
      .map((row) => ({
        id: row.tagId!,
        name: row.tagName!,
      }));

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
        tags: itemTags_list,
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
