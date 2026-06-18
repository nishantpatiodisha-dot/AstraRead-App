import { getDb } from "@/db";
import { grammarTopics } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Route } from "lucide-react";

import HubShell from "@/components/layout/HubShell";
import { getCurrentUser } from "@/lib/auth";
import { Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grammar & Reading Patterns",
  description: "Master the grammar foundations and reading patterns that CAT VARC demands. From articles and modifiers to decoding the invisible architecture of complex arguments.",
};

export const dynamic = 'force-dynamic';

export default async function GrammarIndexPage() {
  const db = getDb();
  const user = await getCurrentUser();
  // Premium check bypassed for now (easy toggle later)
  const isPremium = true; // process.env.NODE_ENV === 'development' || user?.dbUser?.subscriptionTier === 'premium';
  
  const topics = await db.select()
    .from(grammarTopics)
    .orderBy(asc(grammarTopics.sortOrder));

  // Sort Order < 10 are Grammar Foundations, >= 10 are Reading Patterns
  const foundations = topics.filter(t => t.sortOrder < 10);
  const flow = topics.filter(t => t.sortOrder >= 10);

  return (
    <HubShell title="Grammar & Reading" icon={<BookOpen className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      <div className="max-w-5xl mx-auto py-12 px-6 fade-in">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text)] mb-4 font-serif">
            Language & Reading Patterns
          </h1>
          <p className="text-xl text-[var(--color-text-subtle)] max-w-2xl leading-relaxed">
            Rebuild your linguistic foundation. We don&apos;t teach rules to memorize; we teach how authors steer logic so you can navigate complex reading.
          </p>
        </div>

        <div className="space-y-16">
          {/* Grammar Foundations Section */}
          <section>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[var(--color-border)]">
              <div className="p-2 bg-[var(--color-accent-muted)] rounded-lg text-[var(--color-accent)]">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight">Grammar Foundations</h2>
                <p className="text-sm text-[var(--color-text-subtle)] mt-1">Understanding words as functional tools.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundations.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} isLocked={!isPremium && index >= 1} />
              ))}
            </div>
          </section>

          {/* Reading Patterns Section */}
          <section>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[var(--color-border)]">
              <div className="p-2 bg-[var(--color-accent-muted)] rounded-lg text-[var(--color-accent)]">
                <Route size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight">Reading Patterns</h2>
                <p className="text-sm text-[var(--color-text-subtle)] mt-1">Decoding the invisible architecture of arguments.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {flow.map((topic) => (
                <TopicCard key={topic.id} topic={topic} isLocked={!isPremium} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </HubShell>
  );
}

function TopicCard({ topic, isLocked }: { topic: Record<string, unknown>, isLocked: boolean }) {
  return (
    <Link 
      href={`/grammar/topic/${topic.slug}`}
      className="group block relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-[var(--color-text)] group-hover:text-emerald-700 transition-colors flex items-center gap-2">
            {isLocked && <Lock size={16} className="text-[var(--color-text-muted)] shrink-0" />}
            {topic.title as string}
          </h3>
          <span className="shrink-0 inline-block px-2 py-1 bg-[var(--color-bg-subtle)] text-[var(--color-text-subtle)] text-xs font-semibold rounded-md">
            0% Mastery
          </span>
        </div>
        <p className="text-[var(--color-text-subtle)] text-sm leading-relaxed flex-grow">
          {topic.description as string}
        </p>
        
        <div className="mt-6 flex items-center justify-between text-sm font-medium text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
          <span>{isLocked ? 'Unlock to Practice' : 'Start Lesson & Practice'}</span>
          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
            {isLocked ? <Lock size={14} className="inline-block" /> : '→'}
          </span>
        </div>
      </div>
    </Link>
  );
}
