import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles, articleParagraphs, rcQuestions, articleAnalyses } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const db = getDb();

    const allArticles = await db.select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      createdAt: articles.publishedAt,
      paragraphCount: sql<number>`(select count(*)::int from ${articleParagraphs} where ${articleParagraphs.articleId} = ${articles.id})`,
      analysisCount: sql<number>`(select count(*)::int from ${articleAnalyses} where ${articleAnalyses.articleId} = ${articles.id})`
    })
    .from(articles)
    .orderBy(desc(articles.publishedAt));

    const result = allArticles.map(a => ({
      ...a,
      analysisComplete: a.analysisCount > 0,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("List articles error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
