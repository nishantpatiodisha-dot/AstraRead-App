"use client";

import { Clock3, BookOpenText, GraduationCap, PenLine } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardsProps {
  stats: {
    readingMinutes: number;
    completedArticles: number;
    rcAccuracy: number;
    grammarAccuracy: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    { label: "Reading Time", value: `${stats.readingMinutes}m`, icon: Clock3, color: "text-[var(--color-text)]", bg: "bg-[var(--color-bg-muted)]" },
    { label: "Articles Read", value: stats.completedArticles, icon: BookOpenText, color: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent-light)] dark:bg-[var(--color-accent-muted)]" },
    { label: "RC Accuracy", value: `${stats.rcAccuracy}%`, icon: GraduationCap, color: "text-[var(--color-warm)]", bg: "bg-[var(--color-warm-light)] dark:bg-amber-900/20" },
    { label: "Grammar Score", value: `${stats.grammarAccuracy}%`, icon: PenLine, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success-light)] dark:bg-emerald-900/20" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
    >
      {cards.map((card, i) => (
        <motion.div 
          key={i} 
          variants={item}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent)]/30 transition-colors"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} strokeWidth={2.5} />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[var(--color-text)] tracking-tight">{card.value}</p>
            <p className="text-sm font-medium text-[var(--color-text-subtle)] mt-1">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
