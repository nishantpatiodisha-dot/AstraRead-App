import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const { slug } = await params;
    const db = getDb();

    // The cascading deletes on foreign keys will remove paragraphs, questions, analyses, etc.
    const deleted = await db.delete(articles).where(eq(articles.slug, slug)).returning({ id: articles.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error: any) {
    console.error("Delete article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
