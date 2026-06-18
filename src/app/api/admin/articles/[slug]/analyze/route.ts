import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles, articleParagraphs, paragraphExplanations, articleAnalyses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const { slug } = await params;
    const body = await req.json();
    const { paragraphs, summary, tone, vocabulary, newPhrases } = body;

    const db = getDb();

    // 1. Find article
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 2. Update paragraph explanations
    const existingParagraphs = await db.select().from(articleParagraphs).where(eq(articleParagraphs.articleId, article.id));
    
    for (const para of paragraphs) {
      const dbPara = existingParagraphs.find(p => p.position === para.position);
      if (dbPara) {
        const [existingExpl] = await db.select().from(paragraphExplanations).where(eq(paragraphExplanations.paragraphId, dbPara.id)).limit(1);
        if (existingExpl) {
          await db.update(paragraphExplanations)
            .set({
              simplifiedMeaning: para.simplifiedMeaning || "",
              paragraphPurpose: para.purpose || "",
              keyIdea: para.keyIdea || "",
              source: "manual",
            })
            .where(eq(paragraphExplanations.id, existingExpl.id));
        } else {
          await db.insert(paragraphExplanations).values({
            paragraphId: dbPara.id,
            simplifiedMeaning: para.simplifiedMeaning || "",
            paragraphPurpose: para.purpose || "",
            keyIdea: para.keyIdea || "",
            source: "manual",
          });
        }
      }
    }

    // 3. Update article analysis (summary, tone, vocabulary, new phrases)
    const [existingAnalysis] = await db.select().from(articleAnalyses).where(eq(articleAnalyses.articleId, article.id)).limit(1);
    if (existingAnalysis) {
      await db.update(articleAnalyses)
        .set({
          passageSummary: summary || "",
          tone: tone || "",
          difficultVocabulary: vocabulary || [],
          newPhrases: newPhrases || [],
          source: "manual",
        })
        .where(eq(articleAnalyses.articleId, article.id));
    } else {
      await db.insert(articleAnalyses).values({
        articleId: article.id,
        passageSummary: summary || "",
        tone: tone || "",
        difficultVocabulary: vocabulary || [],
        newPhrases: newPhrases || [],
        source: "manual",
      });
    }

    return NextResponse.json({ message: "Analysis saved successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Analysis save error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
