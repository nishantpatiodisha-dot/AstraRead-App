import { getDb } from "@/db";
import { vocabularyItems, articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import HubShell from "@/components/layout/HubShell";
import { BookA, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Vocabulary",
  description: "Track and review words saved from deep reading sessions. Build a rich vocabulary with contextual definitions and source linking.",
};

export const dynamic = 'force-dynamic';

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user || !user.dbUser) {
    return (
      <HubShell title="Vocabulary" icon={<BookA className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
        <div className="max-w-5xl mx-auto py-16 md:py-24 px-4 text-center fade-in">
          <BookA size={48} className="mx-auto mb-6 text-emerald-500/50 md:w-16 md:h-16" />
          <h1 className="text-2xl md:text-3xl font-serif text-[var(--color-text)] mb-4 leading-tight">Build Your Lexicon</h1>
          <p className="text-sm md:text-base text-[var(--color-text-subtle)] max-w-md mx-auto mb-8">
            Sign up to save difficult words directly from articles, review them with spaced repetition, and master CAT-level vocabulary.
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
  
  // Fetch vocabulary items with their source articles
  const items = await db
    .select({
      id: vocabularyItems.id,
      term: vocabularyItems.term,
      meaning: vocabularyItems.meaning,
      contextSentence: vocabularyItems.contextSentence,
      reviewCount: vocabularyItems.reviewCount,
      lastReviewedAt: vocabularyItems.lastReviewedAt,
      createdAt: vocabularyItems.createdAt,
      articleTitle: articles.title,
      articleSlug: articles.slug,
    })
    .from(vocabularyItems)
    .leftJoin(articles, eq(vocabularyItems.articleId, articles.id))
    .where(eq(vocabularyItems.userId, user.dbUser.id))
    .orderBy(desc(vocabularyItems.createdAt));

  return (
    <HubShell title="Vocabulary" icon={<BookA className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      <div className="max-w-7xl mx-auto py-12 px-6 fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text)] mb-4 font-serif">
              My Vocabulary
            </h1>
            <p className="text-xl text-[var(--color-text-subtle)] max-w-2xl leading-relaxed">
              Words you've saved from deep reading sessions.
            </p>
          </div>
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-4 shadow-sm shrink-0 flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold text-[var(--color-text)] leading-none">{items.length}</div>
              <p className="text-sm text-[var(--color-text-subtle)] mt-1">words collected</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-text-subtle)] shadow-sm">
            <BookA size={48} className="mx-auto mb-4 opacity-20" />
            <p>You haven't saved any words yet.</p>
            <p className="text-sm mt-2">Read an article and click "Save to Vocab" on difficult words.</p>
            <Link href="/reading" className="inline-block mt-6 text-emerald-600 font-medium hover:underline">
              Go to Library
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-hover)] transition-colors shadow-sm flex flex-col h-full">
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-[var(--color-text)] font-serif leading-tight mb-1">{item.term}</h4>
                  <p className="text-sm text-[var(--color-text-subtle)] line-clamp-3">{item.meaning}</p>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
                  {item.articleTitle ? (
                    <Link 
                      href={`/reading/${item.articleSlug}`} 
                      className="text-xs text-emerald-600 hover:text-emerald-700 theme-dark:hover:text-emerald-500 hover:underline flex items-center gap-1 max-w-[60%] truncate"
                      title={item.articleTitle}
                    >
                      <span className="truncate">{item.articleTitle}</span>
                      <ArrowRight size={10} className="shrink-0" />
                    </Link>
                  ) : (
                    <span className="text-xs text-[var(--color-text-subtle)]">Saved manually</span>
                  )}

                  <div className="flex gap-0.5 shrink-0" title={`Mastery level: ${Math.min(5, (item.reviewCount || 0) + 1)}/5`}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`w-1.5 h-3 rounded-full ${level <= Math.min(5, (item.reviewCount || 0) + 1) ? 'bg-emerald-500' : 'bg-[var(--color-border)]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HubShell>
  );
}
