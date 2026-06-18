import { getDb } from "../src/db";
import { articles, articleParagraphs, userArticleReads } from "../src/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const db = getDb();
  
  const dbArticles = await db.select({
    id: articles.id,
    title: articles.title,
    paragraphCount: sql<number>`count(distinct ${articleParagraphs.id})::int`,
    readAt: sql<Date | null>`max(${userArticleReads.readAt})`
  })
  .from(articles)
  .leftJoin(articleParagraphs, eq(articleParagraphs.articleId, articles.id))
  .leftJoin(userArticleReads, eq(userArticleReads.articleId, articles.id))
  .groupBy(articles.id)
  .orderBy(desc(articles.publishedAt))
  .limit(5);

  console.log("DB Articles:", dbArticles);
  process.exit(0);
}

main().catch(console.error);
