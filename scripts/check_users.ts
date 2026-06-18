import { getDb } from "../src/db";
import { users, vocabularyItems } from "../src/db/schema";
import { eq, count } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function checkUsers() {
  const db = getDb();
  
  const allUsers = await db.select().from(users);
  console.log(`\n=== ${allUsers.length} users in DB ===`);
  for (const u of allUsers) {
    const [vocabCount] = await db
      .select({ count: count() })
      .from(vocabularyItems)
      .where(eq(vocabularyItems.userId, u.id));
    console.log(`  User: ${u.id}`);
    console.log(`    authProviderUserId: ${u.authProviderUserId}`);
    console.log(`    displayName: ${u.displayName}`);
    console.log(`    email: ${u.email}`);
    console.log(`    vocab items: ${vocabCount.count}`);
    console.log();
  }
}

checkUsers().catch(console.error);
