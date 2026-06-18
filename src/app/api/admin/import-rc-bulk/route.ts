import { getDb } from "@/db";
import { rcPassages, rcQuestions, rcOptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const data = await req.json();
    const db = getDb();

    // data.passages should be an array of { passageText, questions: [] }
    // data.examType, data.year, data.slot

    if (!data.passages || !Array.isArray(data.passages)) {
      throw new Error("Invalid passages format");
    }

    const examType = data.examType;
    const year = parseInt(data.year, 10) || 0;
    const slot = data.slot;

    // Get current passage count to start numbering correctly
    const existingPassages = await db
      .select({ id: rcPassages.id })
      .from(rcPassages)
      .where(
        and(
          eq(rcPassages.examType, examType),
          eq(rcPassages.year, year),
          eq(rcPassages.slot, slot)
        )
      );

    let currentCount = existingPassages.length;
    const insertedPassageIds = [];

    for (const p of data.passages) {
      currentCount++;
      let generatedTitle = `${examType}`;
      if (year !== 0) generatedTitle += ` ${year}`;
      if (slot) generatedTitle += ` ${slot}`;
      generatedTitle += ` – Passage ${currentCount}`;

      const [insertedPassage] = await db
        .insert(rcPassages)
        .values({
          examType,
          year,
          slot,
          title: generatedTitle,
          passage: p.passageText,
          sourceLabel: slot,
          difficulty: "medium",
          estimatedMinutes: 10,
        })
        .returning();

      if (!insertedPassage) {
        throw new Error("Failed to insert passage");
      }

      insertedPassageIds.push(insertedPassage.id);

      // Insert Questions
      for (let i = 0; i < p.questions.length; i++) {
        const q = p.questions[i];
        const [insertedQuestion] = await db
          .insert(rcQuestions)
          .values({
            passageId: insertedPassage.id,
            tag: "inference",
            prompt: q.prompt,
            correctOptionKey: q.correctOptionKey,
            explanation: "",
            toneClues: [],
            trapWords: [],
            inferenceLogic: null,
            sortOrder: i + 1,
          })
          .returning();

        if (insertedQuestion && q.options) {
          for (const opt of q.options) {
            await db.insert(rcOptions).values({
              questionId: insertedQuestion.id,
              optionKey: opt.key,
              text: opt.text,
              explanation: opt.explanation || "",
              isCorrect: opt.key === q.correctOptionKey,
            });
          }
        }
      }
    }

    return Response.json({ success: true, count: insertedPassageIds.length });
  } catch (error: any) {
    console.error("RC Bulk Import Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
