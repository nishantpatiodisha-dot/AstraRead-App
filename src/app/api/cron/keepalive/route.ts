import { getDb } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Keep-alive endpoint to prevent Neon Postgres from auto-suspending.
 * Called by Vercel Cron every 4 minutes.
 */
export async function GET(req: Request) {
  // Verify the request is from Vercel Cron (in production)
  if (process.env.NODE_ENV !== "development") {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Keep-alive ping failed:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
