"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ListChecks, ArrowLeft, Target, MinusCircle } from "lucide-react";

export type OptionType = {
  id: string;
  optionKey: string;
  text: string;
  explanation: string | null;
};

export type QuestionType = {
  id: string;
  prompt: string;
  explanation: string | null;
  toneClues: string[] | null;
  trapWords: string[] | null;
  correctOptionKey: string;
  options: OptionType[];
};

export type PassageResultType = {
  id: string;
  title: string;
  questions: QuestionType[];
};

interface RCResultsViewProps {
  passages: PassageResultType[];
  answers: Record<string, string>;
  totalSeconds: number;
  onBackToPassage: () => void;
}

export default function RCResultsView({ passages, answers, totalSeconds, onBackToPassage }: RCResultsViewProps) {
  // Start with all questions expanded so the user doesn't have to click
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>(
    passages.reduce((acc, p) => {
      p.questions.forEach(q => acc[q.id] = true);
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const allQuestions = passages.flatMap(p => p.questions);
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  allQuestions.forEach(q => {
    const ans = answers[q.id];
    if (!ans) {
      skippedCount++;
    } else if (ans === q.correctOptionKey) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const accuracy = allQuestions.length - skippedCount > 0 
    ? Math.round((correctCount / (allQuestions.length - skippedCount)) * 100) 
    : 0;

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--color-bg)]">
      <div className="w-full max-w-[1400px] mx-auto py-12 px-8 md:px-12 pb-32">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-[var(--color-text)]">Attempt Results</h2>
          <button 
            onClick={onBackToPassage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors text-sm font-medium text-[var(--color-text)] shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Passage View
          </button>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-subtle)] mb-2 font-medium">
              <Target size={18} /> Score
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {correctCount} <span className="text-lg font-medium text-[var(--color-text-subtle)]">/ {allQuestions.length}</span>
            </div>
          </div>
          
          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-subtle)] mb-2 font-medium">
              <ListChecks size={18} /> Accuracy
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {accuracy}%
            </div>
          </div>

          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-subtle)] mb-2 font-medium">
              <Clock size={18} /> Time Taken
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {formatTime(totalSeconds)}
            </div>
          </div>

          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-center gap-3 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"><CheckCircle2 size={16} /> Correct</span>
              <span className="font-bold text-[var(--color-text)]">{correctCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium"><XCircle size={16} /> Incorrect</span>
              <span className="font-bold text-[var(--color-text)]">{incorrectCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-stone-500 font-medium"><MinusCircle size={16} /> Skipped</span>
              <span className="font-bold text-[var(--color-text)]">{skippedCount}</span>
            </div>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-12">
          {passages.map((passage, pIdx) => (
            <div key={passage.id} className="space-y-6">
              <h3 className="text-xl font-bold font-serif text-[var(--color-text)] flex items-center gap-3 pb-2 border-b border-[var(--color-border)]">
                <span className="bg-[var(--color-text)] text-[var(--color-bg)] w-8 h-8 rounded-full flex items-center justify-center text-sm">{pIdx + 1}</span>
                {passage.title}
              </h3>

              <div className="space-y-4">
                {passage.questions.map((q, qIdx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctOptionKey;
                  const isSkipped = !userAnswer;
                  const isExpanded = !!expandedQuestions[q.id];

                  return (
                    <div key={q.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm transition-all hover:border-[var(--color-text-subtle)]">
                      {/* Question Header Row (Clickable to expand) */}
                      <button 
                        onClick={() => toggleQuestion(q.id)}
                        className="w-full flex items-start gap-4 p-5 text-left bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <div className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-full"><CheckCircle2 size={20} /></div>
                          ) : isSkipped ? (
                            <div className="bg-stone-500/10 text-stone-500 p-1.5 rounded-full"><MinusCircle size={20} /></div>
                          ) : (
                            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-1.5 rounded-full"><XCircle size={20} /></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 text-sm font-medium">
                            <span className="text-[var(--color-text-subtle)]">Q{qIdx + 1}</span>
                            {isSkipped ? (
                              <span className="text-stone-500">Skipped (Correct was {q.correctOptionKey})</span>
                            ) : isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Correct! Answer: {q.correctOptionKey}</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400">Incorrect (Your Answer: {userAnswer}, Correct: {q.correctOptionKey})</span>
                            )}
                          </div>
                          {!isExpanded && (
                            <p className="font-medium text-[var(--color-text)] text-base leading-relaxed line-clamp-2">
                              {q.prompt}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 mt-2 text-[var(--color-text-subtle)]">
                          <ChevronDown size={20} className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                          <p className="font-medium text-[var(--color-text)] text-lg mb-6 leading-relaxed">
                            {q.prompt}
                          </p>
                          
                          {/* Options List */}
                          <div className="space-y-3 mb-8">
                            {q.options.map(opt => {
                              const isSelected = userAnswer === opt.optionKey;
                              const isCorrectOption = opt.optionKey === q.correctOptionKey;
                              
                              let optClass = "p-4 rounded-xl border flex flex-col gap-2 ";
                              if (isCorrectOption) {
                                optClass += "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
                              } else if (isSelected && !isCorrectOption) {
                                optClass += "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200";
                              } else {
                                optClass += "border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text)] opacity-70";
                              }

                              return (
                                <div key={opt.id} className={optClass}>
                                  <div className="flex items-start gap-3">
                                    <span className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${
                                      isCorrectOption ? "bg-emerald-500 text-white border-emerald-500" :
                                      isSelected ? "bg-rose-500 text-white border-rose-500" :
                                      "border-[var(--color-border)] text-[var(--color-text-subtle)]"
                                    }`}>
                                      {opt.optionKey}
                                    </span>
                                    <span className="leading-relaxed font-medium">{opt.text}</span>
                                  </div>
                                  
                                  {opt.explanation && (
                                    <div className={`ml-9 mt-1 text-sm leading-relaxed ${
                                      isCorrectOption ? "text-emerald-700 dark:text-emerald-300" :
                                      (isSelected ? "text-rose-700 dark:text-rose-300" : "text-[var(--color-text-subtle)]")
                                    }`}>
                                      <span className="font-semibold block mb-0.5 opacity-70 uppercase tracking-wider text-[10px]">Explanation</span>
                                      {opt.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* General Explanation & Clues */}
                          {(q.explanation || (q.toneClues?.length ?? 0) > 0 || (q.trapWords?.length ?? 0) > 0) && (
                            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                              <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-subtle)] mb-3">Analysis</h4>
                              {q.explanation && (
                                <p className="text-[var(--color-text)] text-sm leading-relaxed mb-4">
                                  {q.explanation}
                                </p>
                              )}
                              
                              {((q.toneClues?.length ?? 0) > 0 || (q.trapWords?.length ?? 0) > 0) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                                  {(q.toneClues?.length ?? 0) > 0 && (
                                    <div>
                                      <span className="block text-xs font-bold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">Tone Clues</span>
                                      <ul className="list-disc pl-4 space-y-1 text-sm text-[var(--color-text-subtle)]">
                                        {q.toneClues?.map((clue, i) => <li key={i}>{clue}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {(q.trapWords?.length ?? 0) > 0 && (
                                    <div>
                                      <span className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Trap Words</span>
                                      <ul className="list-disc pl-4 space-y-1 text-sm text-rose-500">
                                        {q.trapWords?.map((word, i) => <li key={i}>{word}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
