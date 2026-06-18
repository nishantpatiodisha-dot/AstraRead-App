import { config } from "dotenv";
import { closeDb, getDb } from ".";
import { grammarExercises, grammarLessons, grammarTopics } from "./schema";

import { commonErrorsExercises, commonErrorsLesson, commonErrorsTopic } from "./content/grammar-common-errors";
import { partsOfSpeechExercises, partsOfSpeechLesson, partsOfSpeechTopic } from "./content/grammar-parts-of-speech";
import { sentenceStructureExercises, sentenceStructureLesson, sentenceStructureTopic } from "./content/grammar-sentence-structure";
import { argumentStructureExercises, argumentStructureLesson, argumentStructureTopic } from "./content/reading-flow-argument-structure";
import { signalWordsExercises, signalWordsLesson, signalWordsTopic } from "./content/reading-flow-signal-words";

config({ path: ".env.local" });
config();

const db = getDb();

type TopicSeed = { slug: string; title: string; description: string; sortOrder: number; };
type LessonSeed = { title: string; content: string; examples: string[]; };
type ExerciseSeed = { difficulty: "easy" | "medium" | "hard"; prompt: string; choices: string[]; answer: string; explanation: string; };

async function seedGrammarModule(topicData: TopicSeed, lessonData: LessonSeed, exercisesData: ExerciseSeed[]) {
  console.log(`Seeding topic: ${topicData.title}...`);
  
  // Insert Topic
  const [topic] = await db
    .insert(grammarTopics)
    .values(topicData)
    .onConflictDoUpdate({
      target: grammarTopics.slug,
      set: {
        title: topicData.title,
        description: topicData.description,
        sortOrder: topicData.sortOrder,
      },
    })
    .returning();

  if (!topic) {
    console.error(`Failed to insert topic: ${topicData.title}`);
    return;
  }

  // Insert Lesson
  const [lesson] = await db
    .insert(grammarLessons)
    .values({
      ...lessonData,
      topicId: topic.id,
      title: lessonData.title,
      content: lessonData.content,
      examples: lessonData.examples,
      sortOrder: 1,
    })
    .onConflictDoUpdate({
      target: [grammarLessons.topicId, grammarLessons.title],
      set: {
        content: lessonData.content,
        examples: lessonData.examples,
      },
    })
    .returning();

  if (!lesson) {
    console.error(`Failed to insert lesson for topic: ${topicData.title}`);
    return;
  }

  // Insert Exercises
  let sortOrder = 1;
  for (const exercise of exercisesData) {
    await db
      .insert(grammarExercises)
      .values({
        topicId: topic.id,
        lessonId: lesson.id,
        difficulty: exercise.difficulty,
        prompt: exercise.prompt,
        choices: exercise.choices,
        answer: exercise.answer,
        explanation: exercise.explanation,
        sortOrder: sortOrder++,
      })
      .onConflictDoUpdate({
        target: [grammarExercises.topicId, grammarExercises.prompt],
        set: {
          difficulty: exercise.difficulty,
          choices: exercise.choices,
          answer: exercise.answer,
          explanation: exercise.explanation,
          sortOrder: sortOrder - 1,
        },
      });
  }
  console.log(`Successfully seeded ${exercisesData.length} exercises for ${topicData.title}.`);
}

async function main() {
  console.log("Starting Grammar and Reading Flow Database Seed...");

  // Grammar Foundations
  await seedGrammarModule(partsOfSpeechTopic, partsOfSpeechLesson, partsOfSpeechExercises);
  await seedGrammarModule(sentenceStructureTopic, sentenceStructureLesson, sentenceStructureExercises);
  await seedGrammarModule(commonErrorsTopic, commonErrorsLesson, commonErrorsExercises);

  // Reading Flow
  await seedGrammarModule(signalWordsTopic, signalWordsLesson, signalWordsExercises);
  await seedGrammarModule(argumentStructureTopic, argumentStructureLesson, argumentStructureExercises);

  console.log("Database Seed Complete!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
