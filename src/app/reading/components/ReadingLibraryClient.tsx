"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpenText,
  Gauge,
  Search,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ArticleCard from "./ArticleCard";
import { type Article } from "../data/articles";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ReadingLibraryClientProps {
  initialArticles: Article[];
}

export default function ReadingLibraryClient({ initialArticles }: ReadingLibraryClientProps) {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const filtered = useMemo(() => {
    return initialArticles.filter((article) => {
      // Difficulty filter
      if (difficultyFilter !== "All") {
        if (difficultyFilter === "Easy" && article.difficulty !== "Easy") return false;
        if (difficultyFilter === "CAT Level" && article.difficulty !== "CAT Level" && article.difficulty !== "Moderate") return false;
        if (difficultyFilter === "Hard" && article.difficulty !== "Hard" && article.difficulty !== "Advanced" && article.difficulty !== "CAT+") return false;
      }

      if (
        search.trim() &&
        !article.title?.toLowerCase().includes(search.toLowerCase()) &&
        !article.author?.toLowerCase().includes(search.toLowerCase()) &&
        !article.category?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [search, difficultyFilter, initialArticles]);

  // Stats
  const totalArticles = initialArticles.length;
  const inProgress = initialArticles.filter((a) => a.progress > 0 && a.progress < 100).length;
  const completed = initialArticles.filter((a) => a.progress === 100).length;

  return (
    <div className="bg-[var(--color-bg-subtle)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)]">
      {/* Search and Filters */}
      <header className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/import"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm font-medium text-[var(--color-text-subtle)] hover:border-[var(--color-border-strong)] transition-all duration-200"
            >
              <Plus size={15} />
              Import Essay
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-accent)]" />
                <p className="text-sm font-medium text-[var(--color-accent)]">
                  Core training module
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
                Rebuild reading clarity, one paragraph at a time.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-subtle)]">
                Each article is broken into paragraphs for slow, deliberate
                practice.
              </p>
            </div>
            <div className="flex shrink-0 gap-3 font-sans">
              {[
                [
                  "Articles",
                  String(totalArticles),
                  BookOpenText,
                  "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
                ],
                [
                  "In progress",
                  String(inProgress),
                  Gauge,
                  "bg-[var(--color-warm-light)] text-[var(--color-warm)]",
                ],
                [
                  "Completed",
                  String(completed),
                  Sparkles,
                  "bg-[var(--color-success-light)] text-[var(--color-success)]",
                ],
              ].map(([label, value, Icon, style]) => (
                <div
                  key={label as string}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-center min-w-[85px]"
                >
                  <div
                    className={cn(
                      "mx-auto mb-2 grid size-9 place-items-center rounded-lg",
                      style as string,
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <p className="text-xl font-bold text-[var(--color-text)]">
                    {value as string}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-subtle)]">
                    {label as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title..."
              className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-muted)]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-subtle)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="sm:w-48 shrink-0">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-text)] outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-muted)] cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="CAT Level">CAT Level / Moderate</option>
              <option value="Hard">Hard / Advanced</option>
            </select>
          </div>
        </div>

        {/* Results header */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-subtle)]">
            <span className="font-semibold text-[var(--color-text)]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "article" : "articles"} found
          </p>
        </div>

        {/* Article grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((article, index) => (
              <ArticleCard
                key={article.slug}
                article={article}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]">
              <BookOpenText size={28} />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text-subtle)]">
              No articles match your search
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-text)] px-4 text-sm font-medium text-[var(--color-bg)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-text-inverse)]"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
