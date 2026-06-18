import { config } from "dotenv";
config({ path: ".env.local" });
import { getDb } from "../db";
import { grammarTopics } from "../db/schema";
import { inArray } from 'drizzle-orm';

async function run() {
  const db = getDb();
  await db.delete(grammarTopics).where(inArray(grammarTopics.slug, ['subject-verb-agreement', 'parallelism']));
  console.log('Deleted dummy topics');
  process.exit(0);
}
run();
