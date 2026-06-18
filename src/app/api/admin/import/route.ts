import { NextResponse } from "next/server";
import { storeArticle, generateSlug } from "@/lib/ingestion/store";
import { ParsedArticle } from "@/lib/ingestion/types";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const body = await req.json();
    const { title, paragraphs, inlineQuestions, difficulty } = body;

    if (!title || !paragraphs || paragraphs.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields (title, paragraphs)" },
        { status: 400 }
      );
    }

    // Combine paragraphs for fullText
    const fullText = paragraphs.join("\n\n");

    // Format paragraphs for ParsedArticle
    const formattedParagraphs = paragraphs.map((text: string, index: number) => ({
      position: index,
      text: text.trim(),
      connectorWords: []
    }));

    // Generate slug
    const slug = generateSlug(title);

    // Assemble ParsedArticle
    const parsed: ParsedArticle = {
      title,
      url: "",
      slug,
      author: null,
      publishedAt: new Date(),
      category: "Essay",
      imageUrl: null,
      fullText,
      paragraphs: formattedParagraphs,
      inlineQuestions: inlineQuestions || [],
      difficulty: difficulty || "medium",
    };

    // Store in DB
    const wasInserted = await storeArticle(parsed);

    if (!wasInserted) {
      return NextResponse.json(
        { error: "Failed to store article." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Article imported successfully", slug, paragraphCount: paragraphs.length },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Manual import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
