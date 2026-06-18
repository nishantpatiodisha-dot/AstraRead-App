export default function GrammarLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-7 w-40 rounded-lg bg-stone-200 dark:bg-stone-700" />
        </div>

        {/* Section headers */}
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s} className="mb-8">
            <div className="h-5 w-32 rounded bg-stone-200 dark:bg-stone-700 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                  <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-700 mb-2" />
                  <div className="h-4 w-full rounded bg-stone-200 dark:bg-stone-700 mb-1" />
                  <div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-700 mb-4" />
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-700 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
