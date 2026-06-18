import React from 'react';

import { motion } from 'framer-motion';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tone = 'sage' | 'ink' | 'amber' | 'rose';

const toneClasses: Record<Tone, string> = {
  sage: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
  ink: 'bg-slate-50 text-slate-900 ring-slate-100',
  amber: 'bg-amber-50 text-amber-900 ring-amber-100',
  rose: 'bg-rose-50 text-rose-900 ring-rose-100',
};

interface StreakCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}

export default function StreakCard({ icon: Icon, label, value, detail, tone }: StreakCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{value}</p>
        </div>
        <div className={cn('rounded-md p-2 ring-1', toneClasses[tone])}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-subtle)]">{detail}</p>
    </motion.div>
  );
}
