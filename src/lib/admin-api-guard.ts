import { auth } from "@clerk/nextjs/server";

const ADMIN_USER_IDS = process.env.ADMIN_CLERK_IDS
  ? process.env.ADMIN_CLERK_IDS.split(",")
  : [];

/**
 * Verifies the request is from an authenticated admin user.
 * Returns the userId if authorized, or a Response object if not.
 * 
 * Usage in API routes:
 *   const guard = await requireAdminApi();
 *   if (guard instanceof Response) return guard;
 */
export async function requireAdminApi(): Promise<string | Response> {
  // In development, skip auth for easier testing
  if (process.env.NODE_ENV === "development") {
    return "dev-admin";
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Unauthorized — not signed in" },
      { status: 401 }
    );
  }

  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
    return Response.json(
      { error: "Forbidden — admin access required" },
      { status: 403 }
    );
  }

  return userId;
}
