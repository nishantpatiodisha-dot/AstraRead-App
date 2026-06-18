import { config } from 'dotenv';
config({ path: '.env.local' });
import { getDb } from './src/db';
import { articleSources } from './src/db/schema';

async function run() {
  const db = getDb();
  const sources = await db.select().from(articleSources);
  console.log("Sources:", sources.map(s => s.slug));
  process.exit(0);
}
run();
