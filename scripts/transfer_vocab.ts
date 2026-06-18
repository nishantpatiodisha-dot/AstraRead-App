import { getDb } from "../src/db";
import { vocabularyItems, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

// Transfer all vocab from user 20b9871e to f2c3ddf0,
// since Clerk resolves to f2c3ddf0 and that's the "real" user.
const SOURCE_USER = "20b9871e-296d-4971-8cdd-546bd206257b";
const TARGET_USER = "f2c3ddf0-91a7-4ed3-b927-b41d72ef88a2";

async function transferVocab() {
  const db = getDb();
  
  const items = await db
    .select()
    .from(vocabularyItems)
    .where(eq(vocabularyItems.userId, SOURCE_USER));
  
  console.log(`Found ${items.length} vocab items to transfer from ${SOURCE_USER} → ${TARGET_USER}`);
  
  if (items.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  // Update all items to point to the target user
  const result = await db
    .update(vocabularyItems)
    .set({ userId: TARGET_USER })
    .where(eq(vocabularyItems.userId, SOURCE_USER));
  
  console.log("Transfer complete!");
  
  // Verify
  const afterItems = await db
    .select()
    .from(vocabularyItems)
    .where(eq(vocabularyItems.userId, TARGET_USER));
  console.log(`Target user now has ${afterItems.length} vocab items.`);
}

transferVocab().catch(console.error);
