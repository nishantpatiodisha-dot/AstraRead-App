"use client";

import { motion } from "framer-motion";
import { BookOpenText, Clock3, Layers, Lock } from "lucide-react";
import Link from "next/link";
import type { Article } from "../data/articles";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatLastOpened(dateStr: string | null): string {
  if (!dateStr) return "Not started";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function ArticleCard({
  article,
  index,
}: {
  article: Article;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link href={`/reading/${article.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/30 hover:shadow-[0_12px_40px_rgba(47,111,104,0.08)]">
          {/* Progress bar at top */}
          {article.progress > 0 && (
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-bg-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${article.progress}%` }}
                transition={{ duration: 0.6, delay: index * 0.06 + 0.3 }}
                className={cn(
                  "h-full rounded-r-full",
                  article.progress === 100
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-[#2f6f68] to-emerald-400",
                )}
              />
            </div>
          )}

          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold border",
              article.difficulty === "Easy" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
              article.difficulty === "Hard" || article.difficulty === "CAT+" || article.difficulty === "Advanced" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
              "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
            )}>
              {article.difficulty}
            </span>
            {article.progress === 100 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ml-auto">
                Completed
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-1 text-lg font-semibold leading-snug text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-accent)] flex items-center gap-2">
            {article.isLocked && <Lock size={16} className="text-[var(--color-text-muted)] shrink-0" />}
            {article.title}
          </h3>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-subtle)]">
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-[var(--color-text-muted)]" />
              {article.paragraphs.length} paragraphs
            </span>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center gap-2">
              {article.progress > 0 && article.progress < 100 && (
                <>
                  <div className="h-1.5 w-16 rounded-full bg-[var(--color-bg-subtle)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${article.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                    {article.progress}%
                  </span>
                </>
              )}
              {article.progress === 0 && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <BookOpenText size={13} />
                  Not started
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {formatLastOpened(article.lastOpened)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
