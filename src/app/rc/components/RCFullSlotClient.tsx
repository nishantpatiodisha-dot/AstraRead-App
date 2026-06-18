"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Send, CheckCircle2, XCircle, TimerOff, Timer, Play, Pause } from "lucide-react";
import type { rcPassages, rcQuestions, rcOptions } from "@/db/schema";
import RCResultsView from "./RCResultsView";

type PopulatedQuestion = typeof rcQuestions.$inferSelect & {
  options: (typeof rcOptions.$inferSelect)[];
};

type PopulatedPassage = typeof rcPassages.$inferSelect & {
  questions: PopulatedQuestion[];
};

interface RCFullSlotClientProps {
  groupedPassages: PopulatedPassage[];
  title: string;
}

export default function RCFullSlotClient({ groupedPassages, title }: RCFullSlotClientProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Navigation State
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fontZoom, setFontZoom] = useState(110);
  const [viewMode, setViewMode] = useState<"test" | "results">("test");

  // Total Timer for Full Slot: 40 minutes (2400 seconds)
  const TOTAL_SLOT_SECONDS = 40 * 60;

  useEffect(() => {
    if (isSubmitted || !timerEnabled || isPaused) return;
    const interval = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, timerEnabled, isPaused]);

  const formatTime = (totalSeconds: number) => {
    // We can show countdown for mock test
    const remaining = TOTAL_SLOT_SECONDS - totalSeconds;
    const isNegative = remaining < 0;
    const absRemaining = Math.abs(remaining);

    const m = Math.floor(absRemaining / 60);
    const s = absRemaining % 60;
    return `${isNegative ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const currentPassage = groupedPassages[currentPassageIndex];
  const currentQuestions = currentPassage.questions;
  const allQuestions = groupedPassages.flatMap(p => p.questions);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < allQuestions.length) {
      if (!confirm(`You have answered ${Object.keys(answers).length} out of ${allQuestions.length} questions. Are you sure you want to submit?`)) return;
    }
    setIsSubmitted(true);
    setTimerEnabled(false);
    setViewMode("results");

    // In the future, this could post all answers to the DB
  };

  const score = allQuestions.reduce((acc, q) => acc + (answers[q.id] === q.correctOptionKey ? 1 : 0), 0);

  const goToNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else if (currentPassageIndex < groupedPassages.length - 1) {
      setCurrentPassageIndex(i => i + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
    } else if (currentPassageIndex > 0) {
      const prevPassage = groupedPassages[currentPassageIndex - 1];
      setCurrentPassageIndex(i => i - 1);
      setCurrentQuestionIndex(prevPassage.questions.length - 1);
    }
  };

  const isFirstQuestion = currentPassageIndex === 0 && currentQuestionIndex === 0;
  const isLastQuestion = currentPassageIndex === groupedPassages.length - 1 && currentQuestionIndex === currentQuestions.length - 1;

  const fontSizeClass = {
    sm: "prose-sm",
    base: "prose-base",
    lg: "prose-lg",
    xl: "prose-xl",
  }[fontZoom];

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Global Header */}
      <header className="h-16 border-b border-[var(--color-border)] px-6 flex items-center justify-between bg-[var(--color-bg)] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/rc" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-semibold text-[var(--color-text)] leading-tight">{title} Mock Test</h1>
            <p className="text-xs text-[var(--color-text-subtle)]">{groupedPassages.length} Passages • {allQuestions.length} Questions</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Font Zoom Slider */}
            <div className="flex items-center gap-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm font-medium" role="group" aria-label="Text size controls">
              <span className="text-[var(--color-text-subtle)] font-serif text-xs" aria-hidden="true">A-</span>
              <input
                type="range"
                min="80"
                max="200"
                step="5"
                value={fontZoom}
                onChange={(e) => setFontZoom(Number(e.target.value))}
                className="w-24 accent-emerald-500"
                aria-label={`Text size: ${fontZoom}%`}
              />
              <span className="text-[var(--color-text-subtle)] font-serif text-base" aria-hidden="true">A+</span>
              <span className="text-xs text-[var(--color-text-subtle)] w-9 text-right" aria-hidden="true">{fontZoom}%</span>
            </div>

            {!isSubmitted && (
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${timerEnabled
                    ? "bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text)]"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  }`}
              >
                {timerEnabled ? <Timer size={16} /> : <TimerOff size={16} />}
                {timerEnabled ? "Timer On" : "Timer Off"}
              </button>
            )}
          </div>

          {timerEnabled && (
            <div className={`flex items-center gap-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 font-mono text-lg ${secondsElapsed > TOTAL_SLOT_SECONDS ? 'text-rose-600' : 'text-[var(--color-text)]'}`}>
              <Clock size={18} className="text-[var(--color-text-subtle)]" />
              <span className={isPaused ? "opacity-50" : ""}>{formatTime(secondsElapsed)}</span>
              {!isSubmitted && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="ml-2 hover:text-emerald-500 transition-colors text-[var(--color-text-subtle)]"
                  title={isPaused ? "Resume Timer" : "Pause Timer"}
                >
                  {isPaused ? <Play size={18} className="fill-current" /> : <Pause size={18} className="fill-current" />}
                </button>
              )}
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Send size={16} /> Submit Attempt
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-[var(--color-text)] text-[var(--color-bg)] px-4 py-2 rounded-lg text-sm font-bold" aria-live="polite">
                Final Score: {score} / {allQuestions.length}
              </div>
              {viewMode === "test" && (
                <button
                  onClick={() => setViewMode("results")}
                  className="text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
                >
                  View Summary
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Split Screen Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "results" ? (
          <RCResultsView
            passages={groupedPassages}
            answers={answers}
            totalSeconds={secondsElapsed}
            onBackToPassage={() => setViewMode("test")}
          />
        ) : (
          <>
            {/* Left: Passage Area */}
            <div className="w-[60%] flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              {/* Passage Navigation Tabs */}
              <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 pt-2" role="tablist" aria-label="Passage navigation">
                {groupedPassages.map((p, idx) => {
                  const isActive = idx === currentPassageIndex;
                  const isCompleted = p.questions.every((q: PopulatedQuestion) => !!answers[q.id]);

                  return (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Passage ${idx + 1}${isCompleted ? ', completed' : ''}`}
                      onClick={() => {
                        setCurrentPassageIndex(idx);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${isActive
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-transparent text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                        }`}
                    >
                      Passage {idx + 1}
                      {isCompleted && <CheckCircle2 size={14} className="text-emerald-500 opacity-70" />}
                    </button>
                  );
                })}
              </div>

              {/* Passage Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold font-serif mb-6 text-[var(--color-text)]">{currentPassage.title}</h2>
                  <div
                    className="prose prose-stone dark:prose-invert prose-p:leading-loose transition-all duration-300"
                    style={{ fontSize: `${fontZoom}%` }}
                  >
                    {currentPassage.passage.split('\n\n').map((para: string, i: number) => (
                      <p key={i} className="mb-6">{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Questions Area */}
            <div className="w-[40%] flex flex-col bg-[var(--color-bg)]">
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="max-w-xl mx-auto space-y-16 pb-24">
                  {currentQuestions.length > 0 && (() => {
                    const qIdx = currentQuestionIndex;
                    const q = currentQuestions[qIdx];
                    const selected = answers[q.id];
                    const isCorrect = selected === q.correctOptionKey;

                    return (
                      <div key={q.id} className="space-y-6">
                        <div className="flex items-start gap-4">
                          <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center font-semibold text-[var(--color-text)] text-sm">
                            {qIdx + 1}
                          </span>
                          <h3 className="text-lg font-medium text-[var(--color-text)] leading-relaxed pt-0.5">
                            {q.prompt}
                          </h3>
                        </div>

                        <div className="space-y-3 pl-12" role="radiogroup" aria-label={`Options for question ${qIdx + 1}`}>
                          {q.options.map((opt: typeof rcOptions.$inferSelect) => {
                            const isSelected = selected === opt.optionKey;
                            const isCorrectOption = opt.optionKey === q.correctOptionKey;

                            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ";

                            if (!isSubmitted) {
                              btnClass += isSelected
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "border-[var(--color-border)] hover:border-[var(--color-text-subtle)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]";
                            } else {
                              if (isCorrectOption) {
                                btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                              } else if (isSelected && !isCorrectOption) {
                                btnClass += "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                              } else {
                                btnClass += "border-[var(--color-border)] opacity-50 text-[var(--color-text-subtle)]";
                              }
                            }

                            return (
                              <div key={opt.id} className="relative">
                                <button
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => handleSelect(q.id, opt.optionKey)}
                                  disabled={isSubmitted}
                                  className={btnClass}
                                >
                                  <span className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center text-xs font-bold ${!isSubmitted
                                      ? (isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--color-border)] text-[var(--color-text-subtle)]')
                                      : (isCorrectOption
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : (isSelected && !isCorrectOption ? 'border-rose-500 bg-rose-500 text-white' : 'border-[var(--color-border)] text-[var(--color-text-subtle)]'))
                                    }`}>
                                    {opt.optionKey}
                                  </span>
                                  <span className="leading-relaxed">{opt.text}</span>
                                </button>

                                {/* Option Level Explanation */}
                                {isSubmitted && opt.explanation && (
                                  <div className="ml-6 mr-4 mt-2 p-3 bg-[var(--color-bg-subtle)] rounded-lg text-sm text-[var(--color-text-subtle)] border border-[var(--color-border)]">
                                    {opt.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Question Level Explanation */}
                        {isSubmitted && (
                          <div className={`ml-12 mt-6 p-6 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}>
                            <div className="flex items-center gap-2 mb-3">
                              {isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                              <h4 className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {isCorrect ? "Correct!" : "Incorrect"}
                              </h4>
                            </div>

                            {(q.explanation || ((q.toneClues as string[] | null)?.length ?? 0) > 0 || ((q.trapWords as string[] | null)?.length ?? 0) > 0) && (
                              <div className="prose prose-sm prose-stone dark:prose-invert max-w-none mt-2 pt-2 border-t border-[var(--color-border)]">
                                {q.explanation && <p className="text-[var(--color-text)] mb-0">{q.explanation}</p>}

                                {(((q.toneClues as string[] | null)?.length ?? 0) > 0 || ((q.trapWords as string[] | null)?.length ?? 0) > 0) && (
                                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                                    {((q.toneClues as string[] | null)?.length ?? 0) > 0 && (
                                      <div>
                                        <span className="block text-xs font-bold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">Tone Clues</span>
                                        <ul className="list-disc pl-4 space-y-1 text-[var(--color-text-subtle)]">
                                          {(q.toneClues as string[] | null)?.map((clue: string, i: number) => <li key={i}>{clue}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {((q.trapWords as string[] | null)?.length ?? 0) > 0 && (
                                      <div>
                                        <span className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Trap Words</span>
                                        <ul className="list-disc pl-4 space-y-1 text-rose-500">
                                          {(q.trapWords as string[] | null)?.map((word: string, i: number) => <li key={i}>{word}</li>)}
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
                  })()}
                </div>
              </div>

              {/* Pagination Footer */}
              <div className="border-t border-[var(--color-border)] p-6 bg-[var(--color-bg)] flex justify-between shrink-0">
                <button
                  aria-label="Previous question"
                  onClick={goToPrev}
                  disabled={isFirstQuestion}
                  className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text)] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  Previous
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--color-text-subtle)]">
                    Q{currentQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  {!isLastQuestion ? (
                    <button
                      onClick={goToNext}
                      className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
                    >
                      {currentQuestionIndex === currentQuestions.length - 1 ? 'Next Passage' : 'Next Question'}
                    </button>
                  ) : (
                    !isSubmitted && (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-lg font-bold text-sm transition-colors bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <Send size={16} /> Submit Attempt
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
