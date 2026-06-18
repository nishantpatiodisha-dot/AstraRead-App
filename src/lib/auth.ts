import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

// Hardcoded admin list for MVP per user instruction
const ADMIN_USER_IDS = process.env.ADMIN_CLERK_IDS 
  ? process.env.ADMIN_CLERK_IDS.split(",") 
  : [];

/**
 * In development, Clerk JWT validation fails due to Windows clock skew.
 * This helper returns the most recently created user from the DB as a fallback.
 * Using ORDER BY ensures deterministic selection across server renders and actions.
 */
async function getDevFallbackUser() {
  const db = getDb();
  const [fallbackUser] = await db.select().from(users).orderBy(desc(users.createdAt)).limit(1);
  if (fallbackUser) {
    return {
      clerkUserId: fallbackUser.authProviderUserId,
      dbUser: fallbackUser,
      isAdmin: true,
    };
  }
  return null;
}

const isDev = process.env.NODE_ENV === "development";

export async function getCurrentUser() {
  const clerkAuth = await auth();
  const userId = clerkAuth.userId;

  if (!userId) {
    // Dev fallback: bypass Clerk entirely
    if (isDev) return getDevFallbackUser();
    return null;
  }

  const db = getDb();
  
  // Try to find the user in DB
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderUserId, userId))
    .limit(1);

  // If user is in Clerk but not in DB, upsert them
  if (!dbUser) {
    const clerkUser = await currentUser();
    
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || null;
      const displayName = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() 
        : null;

      [dbUser] = await db
        .insert(users)
        .values({
          authProviderUserId: userId,
          email,
          displayName,
        })
        .returning();
    }
  }

  return {
    clerkUserId: userId,
    dbUser,
    isAdmin: isDev ? true : ADMIN_USER_IDS.includes(userId)
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user || !user.dbUser) {
    redirect("/sign-in");
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  if (!user.isAdmin) {
    redirect("/"); 
  }
  
  return user;
}

export async function upsertUser() {
  return await getCurrentUser();
}
