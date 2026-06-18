import "dotenv/config";
import { getDb } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  const db = getDb();
  
  console.log("Relaxing articles table constraints for manual import...");
  
  try {
    // 1. Drop the NOT NULL on source_id
    await db.execute(sql`ALTER TABLE articles ALTER COLUMN source_id DROP NOT NULL`);
    console.log("✓ source_id is now nullable");
  } catch (e: any) {
    console.log("source_id already nullable or error:", e.message);
  }

  try {
    // 2. Drop the NOT NULL on url
    await db.execute(sql`ALTER TABLE articles ALTER COLUMN url DROP NOT NULL`);
    console.log("✓ url is now nullable");
  } catch (e: any) {
    console.log("url already nullable or error:", e.message);
  }

  try {
    // 3. Drop the old unique index on url (it treats two NULLs as equal in some DBs)
    //    and replace with a partial unique index that only applies to non-null urls
    await db.execute(sql`DROP INDEX IF EXISTS articles_url_unique`);
    await db.execute(sql`
      CREATE UNIQUE INDEX articles_url_unique 
      ON articles (url) 
      WHERE url IS NOT NULL
    `);
    console.log("✓ url unique index is now partial (only applies to non-null urls)");
  } catch (e: any) {
    console.log("url index error:", e.message);
  }

  console.log("Done.");
  process.exit(0);
}

migrate();
