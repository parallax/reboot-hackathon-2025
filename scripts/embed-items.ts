import { db } from "@/db/index";
import { items } from "@/db/schema";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { eq, isNull } from "drizzle-orm";

async function embedAllItems() {
  console.log("Starting to embed all items...");

  try {
    // Get all items that don't have embeddings yet
    const itemsWithoutEmbeddings = await db.query.items.findMany({
      with: {
        itemTags: {
          with: {
            tag: true,
          },
        },
      },
      where: isNull(items.embedding),
    });

    console.log(
      `Found ${itemsWithoutEmbeddings.length} items without embeddings`
    );

    for (const item of itemsWithoutEmbeddings) {
      try {
        console.log(`Processing item ${item.id}: ${item.title}`);

        // Get tag IDs for this item
        const tagIds = item.itemTags?.map((itemTag) => itemTag.tagId) || [];

        // Create embedding content (same as in createListing and updateItem)
        const embeddingContent =
          item.title.trim() +
          " " +
          item.description.trim() +
          " " +
          tagIds.join(" ");

        // Generate embedding
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: embeddingContent,
        });

        // Update the item with the embedding
        await db
          .update(items)
          .set({
            embedding: embedding,
          })
          .where(eq(items.id, item.id));

        console.log(` Generated embedding for item ${item.id}`);
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
      }
    }

    console.log("Finished embedding all items");
  } catch (error) {
    console.error("Error in embedAllItems:", error);
  }
}

// Run the script
embedAllItems()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
