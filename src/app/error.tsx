"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 theme-dark:from-rose-950/30 theme-dark:to-rose-900/20">
          <AlertTriangle size={36} className="text-rose-600 theme-dark:text-rose-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--color-text)] font-serif mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--color-text-subtle)] mb-8 leading-relaxed">
          An unexpected error occurred. Don&apos;t worry — your data is safe.
          Try refreshing the page, or head back to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 theme-dark:bg-white theme-dark:text-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 theme-dark:hover:bg-emerald-100"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
