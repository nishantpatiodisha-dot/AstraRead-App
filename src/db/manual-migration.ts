import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing");
  }

  const sql = postgres(connectionString);

  try {
    console.log("Starting manual migration...");

    // 1. Create Enums
    await sql`DO $$ BEGIN CREATE TYPE subscription_tier AS ENUM ('free', 'premium'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
    await sql`DO $$ BEGIN CREATE TYPE grammar_section AS ENUM ('foundations', 'reading_patterns'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
    await sql`DO $$ BEGIN CREATE TYPE bookmark_type AS ENUM ('article', 'rc_passage'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
    console.log("Enums created.");

    // 2. Modify users
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free' NOT NULL;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_goal_label varchar(21);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_goal_date date;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;`;
    console.log("users table updated.");

    // 3. Modify grammarTopics
    await sql`ALTER TABLE grammar_topics ADD COLUMN IF NOT EXISTS section grammar_section DEFAULT 'foundations' NOT NULL;`;
    console.log("grammarTopics table updated.");

    // 4. Modify rcPassages
    await sql`ALTER TABLE rc_passages ADD COLUMN IF NOT EXISTS slot varchar(80);`;
    console.log("rcPassages table updated.");

    // 5. Drop deprecated tables
    await sql`DROP TABLE IF EXISTS paragraph_summaries CASCADE;`;
    await sql`DROP TABLE IF EXISTS reading_sessions CASCADE;`;
    await sql`DROP TABLE IF EXISTS study_sessions CASCADE;`;
    console.log("Deprecated tables dropped.");

    // 6. Create userArticleReads
    await sql`
      CREATE TABLE IF NOT EXISTS user_article_reads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        read_at timestamp with time zone DEFAULT now() NOT NULL,
        time_spent_seconds integer DEFAULT 0 NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS user_article_reads_user_idx ON user_article_reads(user_id, read_at);`;
    console.log("userArticleReads table created.");

    // 7. Create userBookmarks
    await sql`
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
        rc_passage_id uuid REFERENCES rc_passages(id) ON DELETE CASCADE,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS user_bookmarks_user_idx ON user_bookmarks(user_id);`;
    console.log("userBookmarks table created.");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

run();
