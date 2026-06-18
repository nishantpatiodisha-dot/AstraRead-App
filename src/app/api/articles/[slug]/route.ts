import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/db';
import { articles, articleSources, articleParagraphs, paragraphExplanations, articleAnalyses } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { articles as mockArticles } from '@/app/reading/data/articles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const db = getDb();

    // 1. Fetch Article Metadata and Analysis
    const [dbArticle] = await db.select({
      id: articles.id,
      title: articles.title,
      source: articleSources.name,
      imageUrl: articles.imageUrl,
      estimatedReadingTime: articles.estimatedReadMinutes,
      category: articles.category,
      author: articles.author,
      difficultyScore: articles.difficultyScore,
      metadata: articles.metadata,
      // Analysis fields
      passageSummary: articleAnalyses.passageSummary,
      tone: articleAnalyses.tone,
      difficultVocabulary: articleAnalyses.difficultVocabulary,
      newPhrases: articleAnalyses.newPhrases,
      readingDifficultyScore: articleAnalyses.readingDifficultyScore,
    })
    .from(articles)
    .innerJoin(articleSources, eq(articles.sourceId, articleSources.id))
    .leftJoin(articleAnalyses, eq(articles.id, articleAnalyses.articleId))
    .where(eq(articles.slug, slug))
    .limit(1);

    if (dbArticle) {
      // 2. Fetch Paragraphs and Explanations
      const paragraphs = await db.select({
        id: articleParagraphs.id,
        position: articleParagraphs.position,
        text: articleParagraphs.text,
        connectorWords: articleParagraphs.connectorWords,
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

      // Map to frontend structure
      const mappedArticle = {
        slug: slug,
        id: slug,
        title: dbArticle.title,
        source: dbArticle.source,
        category: dbArticle.category || "Culture",
        imageUrl: dbArticle.imageUrl,
        author: dbArticle.author || "Unknown",
        readingTimeMinutes: dbArticle.estimatedReadingTime || 10,
        difficulty: (dbArticle.difficultyScore || 50) < 40 ? 'Moderate' : (dbArticle.difficultyScore || 50) < 70 ? 'Advanced' : 'CAT+',
        progress: 0,
        lastOpened: null,
        overallSummary: dbArticle.passageSummary || "Summary will be generated during the next scheduled AI batch processing.",
        toneOfPassage: dbArticle.tone || "Pending Analysis",
        difficultVocabulary: (dbArticle.difficultVocabulary as Array<{ term: string; meaning: string }>)?.map(v => `${v.term}: ${v.meaning}`) || [],
        newPhrases: (dbArticle.newPhrases as string[]) || [],
        readingDifficultyScore: dbArticle.readingDifficultyScore || dbArticle.difficultyScore || 50,
        paragraphs: paragraphs.map(p => ({
          id: p.id,
          text: p.text,
          connectorWords: p.connectorWords || [],
          simplifiedMeaning: p.explanation?.simplifiedMeaning || "No explanation available yet. (Generates on cron)",
          purpose: p.explanation?.paragraphPurpose || "Not classified",
          centralIdea: p.explanation?.keyIdea || "Not identified",
          structure: "Paragraph",
          keywords: p.connectorWords || []
        })),
        inlineQuestions: (dbArticle.metadata as Record<string, unknown>)?.inlineQuestions || [],
      };

      return NextResponse.json(mappedArticle);
    }

    // Fallback to mock data
    const mockArticle = mockArticles.find(a => a.slug === slug);
    if (mockArticle) {
      return NextResponse.json(mockArticle);
    }

    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
