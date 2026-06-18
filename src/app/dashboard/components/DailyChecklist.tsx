import React, { useState } from 'react';

const defaultTasks = [
  "Read one long paragraph slowly",
  "Write 3 paragraph summaries",
  "Finish one grammar micro-drill",
  "Attempt one inference question",
  "Review today's vocabulary",
];

export default function DailyChecklist() {
  const [checked, setChecked] = useState<boolean[]>(Array(defaultTasks.length).fill(true));

  const toggle = (index: number) => {
    setChecked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const completed = checked.filter(Boolean).length;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Today&apos;s tasks</p>
        <span className="text-xs text-[var(--color-text-muted)]">
          {completed}/{checked.length}
        </span>
      </div>
      <div className="space-y-2">
        {defaultTasks.map((task, i) => (
          <label
            key={task}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-[var(--color-border)] p-2 hover:border-emerald-300 transition-colors"
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="size-4 accent-[#2d6b64]"
            />
            <span className="text-sm text-[var(--color-text-subtle)]">{task}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
