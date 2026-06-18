import { getDb } from "@/db";
import { rcPassages, rcQuestions } from "@/db/schema";
import { desc, inArray, sql } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const db = getDb();

    const passages = await db
      .select({
        id: rcPassages.id,
        title: rcPassages.title,
        year: rcPassages.year,
        slot: rcPassages.slot,
        examType: rcPassages.examType,
        createdAt: rcPassages.createdAt,
      })
      .from(rcPassages)
      .orderBy(desc(rcPassages.createdAt))
      .limit(50);

    if (passages.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const passageIds = passages.map((p) => p.id);

    const questionCounts = await db
      .select({
        passageId: rcQuestions.passageId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(rcQuestions)
      .where(inArray(rcQuestions.passageId, passageIds))
      .groupBy(rcQuestions.passageId);

    const countMap = new Map(
      questionCounts.map((q) => [q.passageId, Number(q.count)])
    );

    const data = passages.map((p) => ({
      id: p.id,
      title: p.title,
      year: p.year,
      slot: p.slot,
      examType: p.examType,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      questionCount: countMap.get(p.id) ?? 0,
    }));

    return Response.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching recent passages:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
