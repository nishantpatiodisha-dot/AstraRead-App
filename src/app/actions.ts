"use server";

import { getDb } from "@/db";
import { userDailyTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleDailyTask(taskId: string, isComplete: boolean) {
  const user = await requireAuth();
  const db = getDb();

  // Ensure the task belongs to the user
  const [task] = await db
    .select()
    .from(userDailyTasks)
    .where(eq(userDailyTasks.id, taskId))
    .limit(1);

  if (!task || task.userId !== user.dbUser!.id) {
    throw new Error("Task not found or unauthorized.");
  }

  await db
    .update(userDailyTasks)
    .set({
      isComplete,
      completedAt: isComplete ? new Date() : null
    })
    .where(eq(userDailyTasks.id, taskId));

  revalidatePath("/");
}

import { vocabularyItems, userArticleReads, articles } from "@/db/schema";

export async function saveVocabulary({ term, meaning, sourceArticleId }: { term: string, meaning: string, sourceArticleId?: string }) {
  const user = await requireAuth();
  const db = getDb();

  let articleId = null;
  if (sourceArticleId) {
    const [article] = await db.select().from(articles).where(eq(articles.slug, sourceArticleId)).limit(1);
    if (article) {
      articleId = article.id;
    }
  }

  await db.insert(vocabularyItems).values({
    userId: user.dbUser!.id,
    term,
    meaning,
    articleId,
  }).onConflictDoNothing();

  revalidatePath("/vocabulary");
}

export async function unsaveVocabulary({ term }: { term: string }) {
  const user = await requireAuth();
  const db = getDb();

  await db.delete(vocabularyItems).where(
    and(
      eq(vocabularyItems.userId, user.dbUser!.id),
      eq(vocabularyItems.term, term)
    )
  );

  revalidatePath("/vocabulary");
}

export async function markArticleAsRead(slug: string, timeSpentSeconds: number) {
  if (timeSpentSeconds < 60) return; // Ignore under 60s

  const user = await requireAuth();
  const db = getDb();

  const [article] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!article) return;

  await db.insert(userArticleReads).values({
    userId: user.dbUser!.id,
    articleId: article.id,
    timeSpentSeconds,
  });
}
