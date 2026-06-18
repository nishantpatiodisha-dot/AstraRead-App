import { getCurrentUser } from "@/lib/auth";
import HubShell from "@/components/layout/HubShell";
import { LoggedInDashboard } from "@/components/dashboard/LoggedInDashboard";
import { LoggedOutDashboard } from "@/components/dashboard/LoggedOutDashboard";
import { CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <HubShell title="Daily Desk" icon={<CalendarCheck className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      {user?.dbUser ? (
        <LoggedInDashboard 
          userId={user.dbUser.id} 
          userName={user.dbUser.displayName} 
        />
      ) : (
        <LoggedOutDashboard />
      )}
    </HubShell>
  );
}
