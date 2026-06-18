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

    // Auto-generate title by counting existing passages for this exam, year, and slot
    const existingPassages = await db
      .select({ id: rcPassages.id })
      .from(rcPassages)
      .where(
        and(
          eq(rcPassages.examType, data.examType),
          eq(rcPassages.year, parseInt(data.year, 10) || 0),
          eq(rcPassages.slot, data.slot)
        )
      );

    const passageNumber = existingPassages.length + 1;
    let generatedTitle = `${data.examType}`;
    if (data.year && parseInt(data.year, 10) !== 0) generatedTitle += ` ${data.year}`;
    if (data.slot) generatedTitle += ` ${data.slot}`;
    generatedTitle += ` – Passage ${passageNumber}`;

    // Insert Passage
    const [insertedPassage] = await db
      .insert(rcPassages)
      .values({
        examType: data.examType,
        year: parseInt(data.year, 10) || 0,
        slot: data.slot,
        title: generatedTitle,
        passage: data.passage,
        sourceLabel: data.slot, // Use slot for sourceLabel to satisfy schema
        difficulty: "medium", // Default to medium
        estimatedMinutes: 10, // Default to 10
      })
      .returning();

    if (!insertedPassage) {
      throw new Error("Failed to insert passage");
    }

    // Insert Questions
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      const [insertedQuestion] = await db
        .insert(rcQuestions)
        .values({
          passageId: insertedPassage.id,
          tag: "inference", // Default tag
          prompt: q.prompt,
          correctOptionKey: q.correctOptionKey,
          explanation: "", // Default empty explanation for the question
          toneClues: [],
          trapWords: [],
          inferenceLogic: null,
          sortOrder: i + 1,
        })
        .returning();

      if (insertedQuestion && q.options) {
        // Insert Options
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

    return Response.json({ success: true, passageId: insertedPassage.id });
  } catch (error: any) {
    console.error("RC Import Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
