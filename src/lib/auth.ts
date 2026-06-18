import { createClient } from "@/utils/supabase/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Hardcoded admin list for MVP per user instruction
const ADMIN_USER_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(",") 
  : [];

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const userId = user.id;
  const db = getDb();
  
  // Try to find the user in DB
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderUserId, userId))
    .limit(1);

  // If user is in Supabase Auth but not in DB, upsert them
  if (!dbUser) {
    const email = user.email || null;
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || email?.split('@')[0] || null;

    [dbUser] = await db
      .insert(users)
      .values({
        authProviderUserId: userId,
        email,
        displayName,
      })
      .returning();
  }

  return {
    authId: userId,
    dbUser,
    isAdmin: user.email ? ADMIN_USER_EMAILS.includes(user.email) : false
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user || !user.dbUser) {
    redirect("/login");
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
