import { Flame } from "lucide-react";

export function StreakCards({ streaks }: { streaks: { streakType: string; currentCount: number; bestCount: number; }[] }) {
  if (!streaks || streaks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {streaks.map((streak) => (
        <div key={streak.streakType} className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 px-4 py-2 rounded-full">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-[var(--color-text)] capitalize">
            {streak.streakType}: {streak.currentCount} Day Streak
          </span>
        </div>
      ))}
    </div>
  );
}
