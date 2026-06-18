import "dotenv/config";
import { getDb } from "../src/db";
import { articles } from "../src/db/schema";

async function clearArticles() {
  console.log("Clearing existing articles and related data...");
  try {
    const db = getDb();
    await db.delete(articles);
    console.log("Articles cleared.");
  } catch (err) {
    console.error("Error clearing articles:", err);
  }
  process.exit(0);
}

clearArticles();
