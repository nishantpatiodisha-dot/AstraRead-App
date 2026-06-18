import { getDb } from "@/db";
import { articles, articleParagraphs, paragraphExplanations, articleAnalyses, vocabularyItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getArticleBySlug, type Article, type VocabEntry } from "../data/articles";
import ArticleReaderClient from "../components/ArticleReaderClient";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const db = getDb();
  const [article] = await db
    .select({ title: articles.title, subtitle: articles.subtitle })
    .from(articles)
    .where(eq(articles.slug, params.slug))
    .limit(1);

  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title}`,
    description: article.subtitle || `Deep reading practice: ${article.title}`,
  };
}

async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const db = getDb();

    const [dbArticle] = await db.select({
      id: articles.id,
      title: articles.title,
      metadata: articles.metadata,
      passageSummary: articleAnalyses.passageSummary,
      tone: articleAnalyses.tone,
      difficultVocabulary: articleAnalyses.difficultVocabulary,
      newPhrases: articleAnalyses.newPhrases,
    })
    .from(articles)
    .leftJoin(articleAnalyses, eq(articles.id, articleAnalyses.articleId))
    .where(eq(articles.slug, slug))
    .limit(1);

    if (dbArticle) {
      const paragraphs = await db.select({
        id: articleParagraphs.id,
        position: articleParagraphs.position,
        text: articleParagraphs.text,
        explanation: {
          simplifiedMeaning: paragraphExplanations.simplifiedMeaning,
          paragraphPurpose: paragraphExplanations.paragraphPurpose,
          keyIdea: paragraphExplanations.keyIdea,
        }
      })
      .from(articleParagraphs)
      .leftJoin(paragraphExplanations, eq(articleParagraphs.id, paragraphExplanations.paragraphId))
      .where(eq(articleParagraphs.articleId, dbArticle.id))
      .orderBy(asc(articleParagraphs.position));

      // Cast the jsonb columns to the right shape
      const vocabRaw = dbArticle.difficultVocabulary as VocabEntry[] | null;
      const phrasesRaw = dbArticle.newPhrases as VocabEntry[] | null;

      return {
        slug,
        title: dbArticle.title,
        source: "Aeon",
        category: "Philosophy",
        author: "Unknown",
        readingTimeMinutes: 0,
        difficulty: "Moderate",
        progress: 0,
        lastOpened: null,
        overallSummary: dbArticle.passageSummary || "",
        toneOfPassage: dbArticle.tone || "",
        difficultVocabulary: vocabRaw || [],
        newPhrases: phrasesRaw || [],
        readingDifficultyScore: 50,
        isLocked: false,
        paragraphs: paragraphs.map(p => ({
          text: p.text,
          // purpose = the structural function label (Introduction, Expansion, etc.)
          purpose: p.explanation?.paragraphPurpose || "",
          simplifiedMeaning: p.explanation?.simplifiedMeaning || "",
          centralIdea: p.explanation?.keyIdea || "",
          structure: p.explanation?.paragraphPurpose || "",
          keywords: []
        })),
        inlineQuestions: ((dbArticle.metadata as Record<string, unknown>)?.inlineQuestions as any[]) || [],
      };
    }
  } catch (error) {
    console.error("Error fetching article in server component:", error);
  }

  return getArticleBySlug(slug) || null;
}

export default async function ReadingPassagePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const article = await fetchArticle(params.slug);

  if (!article) {
    notFound();
  }

  const user = await getCurrentUser();
  let savedTerms: string[] = [];

  if (user?.dbUser) {
    const db = getDb();
    const items = await db
      .select({ term: vocabularyItems.term })
      .from(vocabularyItems)
      .where(eq(vocabularyItems.userId, user.dbUser.id));
    savedTerms = items.map(i => i.term);
  }

  return <ArticleReaderClient article={article} initialSavedWords={savedTerms} />;
}
