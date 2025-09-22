"use server";

import { searchItems } from "./listings-actions";

export async function searchItemsAction(query: string) {
  return await searchItems(query);
}