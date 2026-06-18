import { getDb } from "../src/db";
import { users } from "../src/db/schema";
import { desc } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function check() {
  const db = getDb();
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  for (const u of allUsers) {
    console.log(`${u.id} | created: ${u.createdAt.toISOString()} | auth: ${u.authProviderUserId}`);
  }
  console.log(`\nDev fallback will pick: ${allUsers[0]?.id}`);
}
check().catch(console.error);
