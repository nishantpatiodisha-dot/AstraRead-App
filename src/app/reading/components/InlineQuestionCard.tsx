"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InlineQuestion } from "../data/articles";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function InlineQuestionCard({ 
  question, 
  onCompleted
}: { 
  question: InlineQuestion; 
  onCompleted?: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    if (onCompleted) {
      onCompleted();
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "my-10 rounded-2xl border p-6 sm:p-8 transition-colors duration-500",
        "bg-[var(--color-bg)] border-[var(--color-border)] shadow-sm"
      )}
    >
      <div className={cn(
        "text-xs font-bold tracking-wider uppercase mb-4",
        "text-[var(--color-text-subtle)]"
      )}>
        Reflection
      </div>
      
      <h3 className={cn(
        "text-lg sm:text-xl font-medium mb-6 leading-relaxed font-sans",
        "text-[var(--color-text)]"
      )}>
        {question.prompt}
      </h3>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isThisSelected = selectedOption === opt;
          const isThisCorrect = opt === question.correctAnswer;
          
          let stateStyle = "border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)]";

          if (isAnswered) {
            if (isThisCorrect) {
              stateStyle = "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
            } else if (isThisSelected && !isThisCorrect) {
              stateStyle = "border-red-200 bg-red-50/50 dark:bg-red-900/10 text-red-700/80 dark:text-red-300/80";
            } else {
              stateStyle = "border-[var(--color-border)] opacity-50 text-[var(--color-text-subtle)]";
            }
          }

          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              whileHover={!isAnswered ? { scale: 1.01 } : {}}
              whileTap={!isAnswered ? { scale: 0.99 } : {}}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-300 font-sans text-[15px]",
                stateStyle
              )}
            >
              <div className="flex justify-between items-center gap-4">
                <span>{opt}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-500" />}
                {isAnswered && isThisSelected && !isThisCorrect && <XCircle size={18} className="text-red-500/70" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            className={cn(
              "rounded-xl p-5 border",
              "bg-[var(--color-bg-subtle)] border-[var(--color-border)]"
            )}
          >
            <div className="flex gap-3">
              <Lightbulb size={18} className="shrink-0 mt-0.5 text-[var(--color-text-subtle)]" />
              <div>
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  {question.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
