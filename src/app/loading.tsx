export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 rounded bg-stone-200 theme-dark:bg-stone-700" />
          <div className="h-7 w-32 rounded-lg bg-stone-200 theme-dark:bg-stone-700" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
              <div className="h-4 w-20 rounded bg-stone-200 theme-dark:bg-stone-700 mb-3" />
              <div className="h-8 w-12 rounded bg-stone-200 theme-dark:bg-stone-700" />
            </div>
          ))}
        </div>

        {/* Checklist skeleton */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
          <div className="h-5 w-40 rounded bg-stone-200 theme-dark:bg-stone-700 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-stone-200 theme-dark:bg-stone-700 shrink-0" />
                <div className="h-4 rounded bg-stone-200 theme-dark:bg-stone-700" style={{ width: `${60 + Math.random() * 30}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
