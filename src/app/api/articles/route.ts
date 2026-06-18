import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { articles, articleSources, articleParagraphs } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { articles as mockArticles } from '@/app/reading/data/articles'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    
    const dbArticles = await db.select({
      slug: articles.slug,
      title: articles.title,
      source: articleSources.name,
      category: articles.category,
      estimatedReadingTime: articles.estimatedReadMinutes,
      difficulty: articles.difficultyScore,
      publishedAt: articles.publishedAt,
      author: articles.author,
      paragraphCount: sql<number>`(select count(*)::int from ${articleParagraphs} where ${articleParagraphs.articleId} = ${articles.id})`
    })
    .from(articles)
    .innerJoin(articleSources, eq(articles.sourceId, articleSources.id))
    .orderBy(desc(articles.publishedAt))
    .limit(50);

    if (dbArticles && dbArticles.length > 0) {
      const mapped = dbArticles.map(a => ({
        id: a.slug,
        slug: a.slug,
        title: a.title,
        source: a.source,
        category: a.category || "Culture",
        author: a.author || "Unknown",
        readingTimeMinutes: a.estimatedReadingTime || 10,
        difficulty: (a.difficulty || 50) < 40 ? 'Moderate' : (a.difficulty || 50) < 70 ? 'Advanced' : 'CAT+',
        progress: 0,
        lastOpened: null,
        paragraphs: new Array(a.paragraphCount || 0).fill(null)
      }));
      return NextResponse.json(mapped);
    }
    
    return NextResponse.json(mockArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(mockArticles);
  }
}
