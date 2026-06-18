import { useMemo } from "react";
import { format, subDays } from "date-fns";

export function Heatmap({ data }: { data: Record<string, number> }) {
  // Generate 90 days of activity
  const days = useMemo(() => {
    const today = new Date();
    const d: Date[] = [];
    
    // Get past 90 days
    for (let i = 89; i >= 0; i--) {
      d.push(subDays(today, i));
    }
    
    return d;
  }, []);

  const getShade = (count: number) => {
    if (count === 0) return "bg-[var(--color-bg-subtle)] border border-[var(--color-border)]";
    if (count <= 1) return "bg-emerald-900 border border-emerald-800";
    if (count <= 2) return "bg-emerald-700 border border-emerald-600";
    if (count <= 3) return "bg-emerald-500 border border-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]";
    return "bg-emerald-400 border border-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]";
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-subtle)] p-6 md:p-8 border border-[var(--color-border)] relative overflow-hidden shadow-[var(--shadow-md)] mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--color-accent)] via-transparent to-transparent opacity-[0.05] blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">Activity Heatmap</h3>
        <div className="flex items-center justify-start">
          <div 
            className="grid grid-rows-7 gap-1.5 overflow-x-auto pb-2 auto-cols-max" 
        style={{ gridAutoFlow: 'column' }}
      >
        {/* We push empty divs for the first week to offset the days correctly to align weeks */}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
           <div key={`pad-${i}`} className="w-4 h-4 md:w-5 md:h-5" />
        ))}
        {days.map((day, dIdx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const count = data[dateStr] || 0;
          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${count} tasks completed`}
              className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] ${getShade(count)} transition-all hover:scale-125 hover:z-10 cursor-pointer`}
            />
          );
        })}
        </div>
        </div>
      </div>
    </div>
  );
}
