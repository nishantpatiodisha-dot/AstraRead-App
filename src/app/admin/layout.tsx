export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, uncomment the auth check below:
  // import { requireAdmin } from "@/lib/auth";
  // await requireAdmin();

  // In development, skip Clerk auth check to avoid clock-skew redirect loops.
  // Clerk's JWT validation fails when the Windows clock is even slightly off,
  // causing infinite redirects between localhost and Clerk's hosted sign-in page.
  if (process.env.NODE_ENV !== "development") {
    const { requireAdmin } = await import("@/lib/auth");
    await requireAdmin();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {children}
    </div>
  );
}
