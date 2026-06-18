import { getDb } from "@/db";
import { articles, articleParagraphs, paragraphExplanations, articleAnalyses, articleSources } from "@/db/schema";
import { ParsedArticle } from "./types";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
    
  return baseSlug.substring(0, 150) + "-" + Math.random().toString(36).substring(2, 8);
}

export async function storeArticle(parsed: ParsedArticle): Promise<boolean> {
  const db = getDb();
  
  try {
    const [insertedArticle] = await db.insert(articles).values({
      sourceId: null,
      url: parsed.url || null,
      slug: parsed.slug,
      title: parsed.title,
      author: parsed.author || null,
      category: parsed.category || null,
      imageUrl: parsed.imageUrl || null,
      fullText: parsed.fullText,
      status: "published", 
      publishedAt: parsed.publishedAt,
      metadata: { 
        inlineQuestions: parsed.inlineQuestions || [],
        difficulty: parsed.difficulty || "medium"
      }
    }).returning({ id: articles.id });

    if (!insertedArticle) {
      return false; 
    }

    const articleId = insertedArticle.id;

    // Insert paragraphs (text only, no auto-generated explanations)
    if (parsed.paragraphs.length > 0) {
      const paragraphValues = parsed.paragraphs.map(p => ({
        articleId,
        position: p.position,
        text: p.text,
        connectorWords: p.connectorWords,
      }));

      const insertedParagraphs = await db.insert(articleParagraphs)
        .values(paragraphValues)
        .returning({ id: articleParagraphs.id, position: articleParagraphs.position });

      // Insert blank explanations — the user fills these in manually via Step 2
      const explanationValues = insertedParagraphs.map(p => ({
        paragraphId: p.id,
        simplifiedMeaning: "",
        paragraphPurpose: "",
        keyIdea: "",
        source: "manual" as const,
      }));

      if (explanationValues.length > 0) {
        await db.insert(paragraphExplanations).values(explanationValues);
      }
    }

    // Insert blank article analysis — the user fills this in manually via Step 2
    await db.insert(articleAnalyses).values({
      articleId,
      passageSummary: "",
      tone: "",
      source: "manual",
    });

    return true; 
  } catch (error) {
    logger.error(`Error storing article: ${parsed.title}`, error);
    throw error;
  }
}
