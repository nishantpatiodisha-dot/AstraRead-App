import { getDb } from "@/db";
import { 
  userDailyTasks, 
  userStreaks, 
  userArticleReads, 
  rcAttempts, 
  grammarAttempts, 
  dailyChecklistTemplates 
} from "@/db/schema";
import { and, eq, sql, gte } from "drizzle-orm";

/**
 * Ensures system daily tasks exist for the given user for today.
 * If not, duplicates templates into `userDailyTasks`.
 */
export async function getDailyTasks(userId: string) {
  const db = getDb();
  
  // Use today's date in YYYY-MM-DD format based on UTC
  const today = new Date().toISOString().split("T")[0];
  
  // Find tasks for today
  let tasks = await db
    .select()
    .from(userDailyTasks)
    .where(
      and(
        eq(userDailyTasks.userId, userId),
        eq(userDailyTasks.taskDate, today)
      )
    );

  // If no tasks exist for today, instantiate system tasks from templates
  if (tasks.length === 0) {
    const templates = await db
      .select()
      .from(dailyChecklistTemplates)
      .where(eq(dailyChecklistTemplates.isActive, true));

    if (templates.length > 0) {
      const newTasks = templates.map((t) => ({
        userId,
        templateId: t.id,
        taskDate: today,
        title: t.title,
        category: t.category,
        isComplete: false,
      }));

      await db.insert(userDailyTasks).values(newTasks);
      
      // Fetch the newly inserted tasks
      tasks = await db
        .select()
        .from(userDailyTasks)
        .where(
          and(
            eq(userDailyTasks.userId, userId),
            eq(userDailyTasks.taskDate, today)
          )
        );
    }
  }

  return tasks;
}

/**
 * Returns total reading time, completed articles, RC accuracy, and grammar correctness.
 */
export async function getDashboardStats(userId: string) {
  const db = getDb();

  // Reading Stats
  const [readingStats] = await db
    .select({
      totalSeconds: sql<number>`COALESCE(SUM(${userArticleReads.timeSpentSeconds}), 0)`,
      completedArticles: sql<number>`COUNT(${userArticleReads.id})`,
    })
    .from(userArticleReads)
    .where(eq(userArticleReads.userId, userId));

  // RC Stats
  const [rcStats] = await db
    .select({
      avgAccuracy: sql<number>`COALESCE(AVG(${rcAttempts.scorePercent}), 0)`,
      completedRcPassages: sql<number>`COUNT(DISTINCT ${rcAttempts.passageId})`,
    })
    .from(rcAttempts)
    .where(eq(rcAttempts.userId, userId));

  // Grammar Stats
  const [grammarStats] = await db
    .select({
      totalAttempts: sql<number>`COUNT(${grammarAttempts.id})`,
      correctAttempts: sql<number>`SUM(CASE WHEN ${grammarAttempts.isCorrect} THEN 1 ELSE 0 END)`,
    })
    .from(grammarAttempts)
    .where(eq(grammarAttempts.userId, userId));

  const grammarAccuracy = grammarStats.totalAttempts > 0 
    ? Math.round((grammarStats.correctAttempts / grammarStats.totalAttempts) * 100)
    : 0;

  return {
    readingMinutes: Math.round(Number(readingStats.totalSeconds) / 60),
    completedArticles: Number(readingStats.completedArticles),
    completedRcPassages: Number(rcStats.completedRcPassages),
    rcAccuracy: Math.round(Number(rcStats.avgAccuracy)),
    grammarAccuracy,
  };
}

/**
 * Returns streak data for the user.
 */
export async function getUserStreaks(userId: string) {
  const db = getDb();
  
  const streaks = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId));

  return streaks;
}

/**
 * Generates an activity heatmap map over the last 90 days.
 * Returns { [dateString: string]: completedTaskCount }
 */
export async function getActivityHeatmap(userId: string) {
  const db = getDb();
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startDateStr = ninetyDaysAgo.toISOString().split("T")[0];

  const dailyCounts = await db
    .select({
      date: userDailyTasks.taskDate,
      completedCount: sql<number>`SUM(CASE WHEN ${userDailyTasks.isComplete} THEN 1 ELSE 0 END)`,
    })
    .from(userDailyTasks)
    .where(
      and(
        eq(userDailyTasks.userId, userId),
        gte(userDailyTasks.taskDate, startDateStr)
      )
    )
    .groupBy(userDailyTasks.taskDate);

  const heatmap: Record<string, number> = {};
  
  for (const record of dailyCounts) {
    if (Number(record.completedCount) > 0) {
      heatmap[record.date] = Number(record.completedCount);
    }
  }

  return heatmap;
}
