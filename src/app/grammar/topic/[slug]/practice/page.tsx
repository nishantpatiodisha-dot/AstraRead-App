import { getDb } from "@/db";
import { grammarTopics, grammarExercises } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import GrammarPracticeClient from "../../../components/GrammarPracticeClient";

export const dynamic = 'force-dynamic';

export default async function GrammarPracticePage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const db = getDb();
  
  const [topic] = await db.select()
    .from(grammarTopics)
    .where(eq(grammarTopics.slug, params.slug))
    .limit(1);

  if (!topic) {
    notFound();
  }

  const exercises = await db.select()
    .from(grammarExercises)
    .where(eq(grammarExercises.topicId, topic.id))
    .orderBy(asc(grammarExercises.sortOrder));

  if (!exercises || exercises.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <GrammarPracticeClient topic={topic} exercises={exercises} />
    </div>
  );
}
