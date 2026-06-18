"use server";

import { getDb } from "@/db";
import { rcPassages, rcQuestions } from "@/db/schema";
import { desc, sql, inArray } from "drizzle-orm";

export async function getRecentPassages() {
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
    return [];
  }

  const passageIds = passages.map(p => p.id);

  // Efficient: count questions per passage with GROUP BY instead of fetching all rows
  const questionCounts = await db
    .select({
      passageId: rcQuestions.passageId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(rcQuestions)
    .where(inArray(rcQuestions.passageId, passageIds))
    .groupBy(rcQuestions.passageId);

  const countMap = new Map(questionCounts.map(q => [q.passageId, Number(q.count)]));

  return passages.map(p => ({
    id: p.id,
    title: p.title,
    year: p.year,
    slot: p.slot,
    examType: p.examType,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    questionCount: countMap.get(p.id) ?? 0,
  }));
}
