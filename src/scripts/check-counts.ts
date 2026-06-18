import { config } from "dotenv";
config({ path: ".env.local" });
import { getDb } from "../db";
import { grammarExercises, grammarTopics } from "../db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  const topics = await db.select().from(grammarTopics);
  for (const topic of topics) {
    const exercises = await db.select().from(grammarExercises).where(eq(grammarExercises.topicId, topic.id));
    console.log(`Topic: ${topic.title} (${exercises.length} exercises)`);
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    for (const e of exercises) {
      if (e.difficulty in difficulties) {
        difficulties[e.difficulty as 'easy'|'medium'|'hard']++;
      }
    }
    console.log(`  Easy: ${difficulties.easy}, Medium: ${difficulties.medium}, Hard: ${difficulties.hard}`);
  }
  process.exit(0);
}
run();
