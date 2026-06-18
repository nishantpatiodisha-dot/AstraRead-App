export default function RCLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 rounded bg-stone-200 theme-dark:bg-stone-700" />
          <div className="h-7 w-32 rounded-lg bg-stone-200 theme-dark:bg-stone-700" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-6 border-b border-[var(--color-border)] mb-8">
          <div className="h-4 w-20 rounded bg-stone-200 theme-dark:bg-stone-700 mb-4" />
          <div className="h-4 w-28 rounded bg-stone-200 theme-dark:bg-stone-700 mb-4" />
        </div>

        {/* Year pills skeleton */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-stone-200 theme-dark:bg-stone-700" />
          ))}
        </div>

        {/* Passage cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-14 rounded bg-stone-200 theme-dark:bg-stone-700" />
                <div className="h-4 w-24 rounded bg-stone-200 theme-dark:bg-stone-700" />
              </div>
              <div className="h-6 w-3/5 rounded bg-stone-200 theme-dark:bg-stone-700 mb-2" />
              <div className="flex items-center gap-4 mt-4">
                <div className="h-4 w-16 rounded bg-stone-200 theme-dark:bg-stone-700" />
                <div className="h-8 w-16 rounded-lg bg-stone-200 theme-dark:bg-stone-700 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
