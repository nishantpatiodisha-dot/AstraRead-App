"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { ProgressRing } from "./ProgressRing";

export function WelcomeBanner({ name, completedTasks, totalTasks, stats }: { 
  name: string | null; 
  completedTasks: number; 
  totalTasks: number;
  stats?: { completedArticles: number; completedRcPassages: number };
}) {
  const dateStr = format(new Date(), "EEEE, MMMM do");
  const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8 rounded-3xl bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-subtle)] p-6 md:p-10 border border-[var(--color-border)] relative overflow-hidden shadow-[var(--shadow-md)]"
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--color-accent)] via-transparent to-transparent opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-[0.05] blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <p className="text-[var(--color-text-subtle)] font-medium tracking-[0.2em] uppercase text-xs">
            {dateStr}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)] leading-tight tracking-tight">
            Welcome back, <span className="text-[var(--color-accent)]">{name?.split(' ')[0] || "Reader"}</span>.
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-lg text-base md:text-lg leading-relaxed">
            You've completed <strong className="text-[var(--color-text)] font-semibold">{stats?.completedArticles || 0} essays</strong> and mastered <strong className="text-[var(--color-text)] font-semibold">{stats?.completedRcPassages || 0} RC passages</strong>. Consistency builds mastery.
          </p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-5 bg-[var(--color-bg-elevated)]/80 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-lg)] shrink-0"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Daily Progress</p>
            <p className="text-xs font-medium text-[var(--color-text-subtle)] bg-[var(--color-bg-muted)] px-2 py-1 rounded-md inline-block">
              {completedTasks}/{totalTasks} Complete
            </p>
          </div>
          <ProgressRing size={64} strokeWidth={5} percent={percent} />
        </motion.div>
      </div>
    </motion.div>
  );
}
