"use server";
import { db } from '@/db/index';
import { tags } from '@/db/schema';

export async function getTags() {
  try {
    const allTags = await db.select().from(tags);
    return allTags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return mock data if database fetch fails
    return [
      { id: 1, name: "Design" },
      { id: 2, name: "Development" },
      { id: 3, name: "Marketing" },
      { id: 4, name: "Consulting" },
      { id: 5, name: "Workspace" },
      { id: 6, name: "Equipment" },
      { id: 7, name: "Services" },
      { id: 8, name: "Products" }
    ];
  }
}