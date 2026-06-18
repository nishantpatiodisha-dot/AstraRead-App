import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/vocabulary(.*)",
  "/progress(.*)",
  "/grammar(.*)",
  "/admin(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // In development, skip ALL Clerk route protection.
  // Windows clock skew causes Clerk's JWT validation to always fail,
  // producing infinite redirect loops. Auth is handled by the dev
  // fallback in src/lib/auth.ts instead.
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
