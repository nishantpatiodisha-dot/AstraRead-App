"use client";

import { useTransition, useState } from "react";
import { Check, Circle } from "lucide-react";
import { toggleDailyTask } from "@/app/actions";

interface Task {
  id: string;
  title: string;
  category: string;
  isComplete: boolean;
}

export function DailyTasks({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, isComplete: newStatus } : t)
    );

    startTransition(async () => {
      try {
        await toggleDailyTask(taskId, newStatus);
      } catch (e) {
        // Revert on error
        setTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, isComplete: currentStatus } : t)
        );
      }
    });
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-subtle)] p-6 md:p-8 border border-[var(--color-border)] relative overflow-hidden shadow-[var(--shadow-md)] mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--color-accent)] via-transparent to-transparent opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-[0.05] blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Daily Action Plan</h3>
          <span className="text-sm text-[var(--color-text-subtle)] font-medium">
            {tasks.filter(t => t.isComplete).length}/{tasks.length} Done
          </span>
        </div>
      
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleToggle(task.id, task.isComplete)}
            disabled={isPending}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              task.isComplete 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-[var(--color-bg-subtle)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              task.isComplete ? "bg-emerald-500 text-white" : "bg-transparent border-2 border-[var(--color-text-subtle)] text-transparent"
            }`}>
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <p className={`font-medium transition-colors ${task.isComplete ? "text-emerald-700 dark:text-emerald-400 line-through opacity-70" : "text-[var(--color-text)]"}`}>
                {task.title}
              </p>
              <p className="text-xs text-[var(--color-text-subtle)] capitalize">
                {task.category}
              </p>
            </div>
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
