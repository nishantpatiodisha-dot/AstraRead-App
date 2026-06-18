export default function ReadingLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 rounded bg-stone-200 theme-dark:bg-stone-700" />
          <div className="h-7 w-36 rounded-lg bg-stone-200 theme-dark:bg-stone-700" />
        </div>

        {/* Hero section skeleton */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 mb-6">
          <div className="h-4 w-32 rounded bg-stone-200 theme-dark:bg-stone-700 mb-3" />
          <div className="h-8 w-3/4 rounded bg-stone-200 theme-dark:bg-stone-700 mb-2" />
          <div className="h-4 w-1/2 rounded bg-stone-200 theme-dark:bg-stone-700" />
        </div>

        {/* Search bar skeleton */}
        <div className="h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] mb-6" />

        {/* Article grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-12 rounded-full bg-stone-200 theme-dark:bg-stone-700" />
                <div className="h-5 w-16 rounded-full bg-stone-200 theme-dark:bg-stone-700" />
              </div>
              <div className="h-5 w-4/5 rounded bg-stone-200 theme-dark:bg-stone-700 mb-2" />
              <div className="h-5 w-3/5 rounded bg-stone-200 theme-dark:bg-stone-700 mb-4" />
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--color-border)]">
                <div className="h-3 w-20 rounded bg-stone-200 theme-dark:bg-stone-700" />
                <div className="h-3 w-16 rounded bg-stone-200 theme-dark:bg-stone-700 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
