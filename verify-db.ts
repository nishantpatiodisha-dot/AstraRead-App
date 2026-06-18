import { config } from 'dotenv';
config({ path: '.env.local' });
import { getDb } from './src/db';
import { articles, articleParagraphs } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const db = getDb();
  const allArticles = await db.select().from(articles);
  console.log("=== DB Verification ===");
  console.log("Total articles in DB:", allArticles.length);

  for (const article of allArticles.slice(0, 3)) { // Check first 3 articles
    console.log(`\nTitle: ${article.title}`);
    console.log(`URL: ${article.url}`);
    
    // Check paragraphs
    const paragraphs = await db.select().from(articleParagraphs).where(eq(articleParagraphs.articleId, article.id));
    console.log(`Paragraph count: ${paragraphs.length}`);
    
    if (paragraphs.length > 0) {
      const firstPara = paragraphs[0].text;
      console.log(`First paragraph length: ${firstPara.length}`);
      console.log(`First paragraph snippet: ${firstPara.substring(0, 200).replace(/\n/g, ' ')}...`);
    } else {
      console.log("NO PARAGRAPHS FOUND FOR THIS ARTICLE!");
    }
    
    // Check fullText
    console.log(`Stored fullText length: ${article.fullText ? article.fullText.length : 0}`);
    if (article.fullText) {
      console.log(`Stored fullText snippet: ${article.fullText.substring(0, 200).replace(/\n/g, ' ')}...`);
    }
  }

  console.log("\n=== Checking API Endpoint Simulation ===");
  // Simulate what the API is doing
  const testArticle = allArticles[0];
  const apiParagraphs = await db.select().from(articleParagraphs).where(eq(articleParagraphs.articleId, testArticle.id));
  console.log(`API would return ${apiParagraphs.length} paragraphs for slug ${testArticle.slug}`);

  process.exit(0);
}
run();
