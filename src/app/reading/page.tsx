import { getDb } from "@/db";
import { articles, articleSources, articleParagraphs, userArticleReads } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { articles as mockArticles, type Article } from "./data/articles";
import ReadingLibraryClient from "./components/ReadingLibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Reading Library",
  description: "Build deep comprehension skills with long-form essays from Aeon, The Guardian, and The Hindu. Paragraph-by-paragraph analysis, vocabulary, and tone breakdowns.",
};

export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";

async function fetchLibraryArticles(): Promise<Article[]> {
  try {
    const db = getDb();
    const user = await getCurrentUser();
    // Premium check bypassed for now (easy toggle later)
    const isPremium = true; // user?.dbUser?.subscriptionTier === 'premium';

    const dbArticles = await db.select({
      slug: articles.slug,
      title: articles.title,
      category: articles.category,
      estimatedReadingTime: articles.estimatedReadMinutes,
      difficulty: articles.difficultyScore,
      publishedAt: articles.publishedAt,
      author: articles.author,
      paragraphCount: sql<number>`count(distinct ${articleParagraphs.id})::int`,
      readAt: sql<Date | null>`max(${userArticleReads.readAt})`,
      metadata: articles.metadata
    })
      .from(articles)
      .leftJoin(articleParagraphs, eq(articleParagraphs.articleId, articles.id))
      .leftJoin(
        userArticleReads,
        and(
          eq(userArticleReads.articleId, articles.id),
          user?.dbUser?.id ? eq(userArticleReads.userId, user.dbUser.id) : sql`false`
        )
      )
      .groupBy(articles.id)
      .orderBy(desc(articles.publishedAt))
      .limit(50);

    if (dbArticles && dbArticles.length > 0) {
      return dbArticles.map((a, index) => ({
        id: a.slug,
        slug: a.slug || "",
        title: a.title,
        source: "Aeon", // placeholder
        category: (a.category as "Science" | "Philosophy" | "Literature") || "Philosophy",
        author: a.author || "Unknown",
        readingTimeMinutes: a.estimatedReadingTime || 10,
        difficulty: (
          a.metadata && typeof a.metadata === 'object' && 'difficulty' in a.metadata 
            ? (a.metadata.difficulty === 'easy' ? 'Easy' : a.metadata.difficulty === 'hard' ? 'Hard' : 'CAT Level') 
            : ((a.difficulty || 50) < 40 ? "Moderate" : (a.difficulty || 50) < 70 ? "Advanced" : "CAT+")
        ) as any,
        progress: a.readAt ? 100 : 0,
        lastOpened: a.readAt ? new Date(a.readAt).toISOString() : null,
        paragraphs: new Array(Number(a.paragraphCount) || 0).fill(null),
        overallSummary: "",
        toneOfPassage: "",
        difficultVocabulary: [],
        newPhrases: [],
        readingDifficultyScore: a.difficulty || 50,
        isLocked: false // Freemium completely removed from reading module
      }));
    }
  } catch (error) {
    console.error("Error fetching database articles in server component:", error);
  }

  // Fallback to mock data if DB query fails or has no rows
  return mockArticles;
}

import HubShell from "@/components/layout/HubShell";
import { BookOpenText } from "lucide-react";

export default async function ReadingLandingPage() {
  const initialArticles = await fetchLibraryArticles();

  return (
    <HubShell title="Deep Reading" icon={<BookOpenText className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      <ReadingLibraryClient initialArticles={initialArticles} />
    </HubShell>
  );
}
