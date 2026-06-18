import { getDb } from "../src/db";
import { vocabularyItems } from "../src/db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

async function checkVocab() {
  const db = getDb();
  const items = await db.select().from(vocabularyItems);
  console.log("Total vocab items in DB:", items.length);
  if (items.length > 0) {
    console.log(items);
  }
}

checkVocab().catch(console.error);
