"use server";
import { db } from "@/db/index";

export async function getTags() {
  return await db.query.tags.findMany();
}
