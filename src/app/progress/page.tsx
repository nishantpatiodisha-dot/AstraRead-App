import { getDb } from "@/db";
import { userArticleReads, rcAttempts, grammarAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import HubShell from "@/components/layout/HubShell";
import { Activity, BookOpen, GraduationCap, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Progress",
  description: "Track your cumulative reading, RC practice, and grammar exercise progress. Positive-only analytics to keep you motivated.",
};

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user || !user.dbUser) {
    return (
      <HubShell title="Progress" icon={<Activity className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
        <div className="max-w-5xl mx-auto py-16 md:py-24 px-4 text-center fade-in">
          <Activity size={48} className="mx-auto mb-6 text-emerald-500/50 md:w-16 md:h-16" />
          <h1 className="text-2xl md:text-3xl font-serif text-[var(--color-text)] mb-4 leading-tight">Track Your Mastery</h1>
          <p className="text-sm md:text-base text-[var(--color-text-subtle)] max-w-md mx-auto mb-8">
            Create a free account to track your reading streaks, RC attempts, and grammar progress over time.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="px-6 py-3 bg-[var(--color-text)] hover:opacity-90 text-[var(--color-bg)] font-medium rounded-xl transition-opacity">
              Create Free Account
            </Link>
            <Link href="/login" className="px-6 py-3 bg-[var(--color-bg-subtle)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-medium rounded-xl transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </HubShell>
    );
  }

  const db = getDb();
  
  // Fetch stats
  const reads = await db.select().from(userArticleReads).where(eq(userArticleReads.userId, user.dbUser.id));
  const rc = await db.select().from(rcAttempts).where(eq(rcAttempts.userId, user.dbUser.id));
  const grammar = await db.select().from(grammarAttempts).where(eq(grammarAttempts.userId, user.dbUser.id));

  const stats = [
    {
      title: "Articles Deep Read",
      value: reads.length,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    },
    {
      title: "RC Passages Completed",
      value: rc.length,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      title: "Grammar Exercises Done",
      value: grammar.length,
      icon: CheckCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
    }
  ];

  return (
    <HubShell title="Progress" icon={<Activity className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      <div className="max-w-5xl mx-auto py-12 px-6 fade-in">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text)] mb-4 font-serif">
            Your Progress
          </h1>
          <p className="text-xl text-[var(--color-text-subtle)] max-w-2xl leading-relaxed">
            Track your cumulative effort and reading loyalty over time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-[var(--color-bg)] border ${stat.border} rounded-2xl p-6 shadow-sm`}>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-[var(--color-text-subtle)] font-medium mb-1">{stat.title}</h3>
              <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] px-6 py-4">
             <h3 className="font-semibold text-[var(--color-text)]">Recent Activity Timeline</h3>
          </div>
          <div className="p-12 text-center text-[var(--color-text-subtle)]">
             <Activity size={48} className="mx-auto mb-4 opacity-20" />
             <p>Your detailed activity timeline will appear here.</p>
             <p className="text-sm mt-2">Complete more exercises and readings to unlock detailed analytics.</p>
          </div>
        </div>
      </div>
    </HubShell>
  );
}
