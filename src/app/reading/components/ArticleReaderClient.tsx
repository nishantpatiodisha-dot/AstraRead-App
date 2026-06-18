"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Play,
  Pause,
  Lightbulb,
  ChevronDown
} from "lucide-react";
import ArticleSummary from "./ArticleSummary";
import InlineQuestionCard from "./InlineQuestionCard";
import { Article } from "../data/articles";
import { markArticleAsRead } from "@/app/actions";
import ImmersiveShell from "@/components/layout/ImmersiveShell";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ArticleReaderClientProps {
  article: Article;
  initialSavedWords?: string[];
}

export default function ArticleReaderClient({ article, initialSavedWords = [] }: ArticleReaderClientProps) {
  const [fontSize, setFontSize] = useState(20);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);

  // --- Progressive Disclosure (Soft Gate) ---
  // Collect unique checkpoint paragraph indices from inline questions
  const checkPoints = useMemo(() => {
    const points: number[] = [];
    if (!article.inlineQuestions) return points;
    article.inlineQuestions.forEach(q => {
      if (!points.includes(q.insertAfterParagraph)) {
        points.push(q.insertAfterParagraph);
      }
    });
    return points.sort((a, b) => a - b);
  }, [article.inlineQuestions]);

  const [currentCheckpointIdx, setCurrentCheckpointIdx] = useState(0);
  // Tracks which checkpoints have had their questions expanded inline
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Record<number, boolean>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  // How far down the essay the user can see
  const maxVisibleIndex = checkPoints.length > 0 && currentCheckpointIdx < checkPoints.length
    ? checkPoints[currentCheckpointIdx]
    : article.paragraphs.length - 1;

  const handleExpandCheckpoint = (cpIdx: number) => {
    setExpandedCheckpoints(prev => ({ ...prev, [cpIdx]: true }));
  };

  const handleSkipCheckpoint = () => {
    setCurrentCheckpointIdx(idx => idx + 1);
  };

  const handleQuestionAnswered = (qId: string) => {
    setAnsweredQuestions(prev => {
      const next = { ...prev, [qId]: true };

      // Check if all questions for the current checkpoint are now answered
      if (checkPoints.length > 0 && currentCheckpointIdx < checkPoints.length) {
        const cpTarget = checkPoints[currentCheckpointIdx];
        const questionsForCp = article.inlineQuestions?.filter(q => q.insertAfterParagraph === cpTarget) || [];
        const allAnswered = questionsForCp.every(q => next[q.id]);

        if (allAnswered) {
          // Auto-advance to next section after a brief pause for reading the explanation
          setTimeout(() => {
            setCurrentCheckpointIdx(idx => idx + 1);
          }, 1200);
        }
      }

      return next;
    });
  };

  // Timer
  useEffect(() => {
    if (!isReading || isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isReading, isCompleted]);

  return (
    <ImmersiveShell
      rightAction={
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAnalysisMode(!analysisMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
              analysisMode
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-[var(--color-bg-subtle)] text-[var(--color-text-subtle)] hover:bg-stone-200 dark:hover:bg-stone-800"
            )}
          >
            <Lightbulb size={14} />
            {analysisMode ? "Analysis On" : "Analysis"}
          </button>

          <div className="flex items-center gap-1 rounded-lg border px-1" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <button onClick={() => setFontSize(s => Math.max(14, s - 1))} className="grid size-8 place-items-center" style={{ color: 'var(--color-text)' }}>
              <Minus size={13} />
            </button>
            <span className="min-w-[28px] text-center text-xs font-mono" style={{ color: 'var(--color-text)' }}>{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="grid size-8 place-items-center" style={{ color: 'var(--color-text)' }}>
              <Plus size={13} />
            </button>
          </div>
        </div>
      }
    >
      {/* Single-column reading layout — always */}
      <main className="mx-auto max-w-4xl px-6 lg:px-8 py-12 lg:py-16">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className={cn(
            "text-5xl sm:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-8 font-serif",
            "text-[var(--color-text)]"
          )}>
            {article.title}
          </h1>
        </motion.div>

        {/* Article body */}
        <div className="relative">
          <div className="space-y-10">
            {article.paragraphs.map((p, index) => {
              // Only render paragraphs up to the current soft-gate boundary
              if (index > maxVisibleIndex) return null;

              const text = p.text;
              const isHeading = text.length < 100 && !text.includes(".") && index === 0;
              const isFirst = index === 0 || (index === 1 && article.paragraphs[0].text.length < 100);
              const questionsAfterThis = article.inlineQuestions?.filter(q => q.insertAfterParagraph === index) || [];
              const isCurrentCheckpoint = checkPoints.length > 0 && currentCheckpointIdx < checkPoints.length && checkPoints[currentCheckpointIdx] === index;
              const checkpointIdxForThis = checkPoints.indexOf(index);
              const isExpandedCheckpoint = expandedCheckpoints[checkpointIdxForThis] || false;
              const isPastCheckpoint = checkpointIdxForThis >= 0 && checkpointIdxForThis < currentCheckpointIdx;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Paragraph text */}
                  {isHeading ? (
                    <h2
                      className={cn(
                        "font-serif italic font-bold mt-16 mb-6 tracking-tight leading-snug transition-colors duration-300",
                        "text-[var(--color-accent)]"
                      )}
                      style={{ fontSize: `${fontSize * 1.6}px` }}
                    >
                      {text}
                    </h2>
                  ) : (
                    <p
                      className={cn(
                        "leading-[1.75] transition-colors duration-300 font-reading",
                        "text-[var(--color-text)]",
                        isFirst && "first-letter:text-[4em] first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:leading-[0.8] first-letter:mt-2 first-letter:font-serif"
                      )}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {text}
                    </p>
                  )}

                  {/* Analysis mode explanation cards */}
                  <AnimatePresence>
                    {analysisMode && (p.simplifiedMeaning || p.centralIdea || p.purpose) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 mb-8 overflow-hidden"
                      >
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-5 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-xl" />
                          <div className="flex items-start gap-3 mb-3">
                            {p.purpose && (
                              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full mt-0.5">
                                {p.purpose}
                              </span>
                            )}
                            {p.centralIdea && (
                              <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                                {p.centralIdea}
                              </p>
                            )}
                          </div>
                          {p.simplifiedMeaning && (
                            <p className="text-sm text-[var(--color-text-subtle)] leading-relaxed">
                              {p.simplifiedMeaning}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inline questions at this checkpoint */}
                  {questionsAfterThis.length > 0 && (() => {
                    const hasBeenExpanded = expandedCheckpoints[checkpointIdxForThis] || false;
                    const showSoftGate = isCurrentCheckpoint && !hasBeenExpanded;
                    const showQuestions = hasBeenExpanded || isPastCheckpoint;

                    return (
                      <div className="mt-12 mb-8">
                        {/* Soft-gate barrier (only for current unexpanded checkpoint) */}
                        {showSoftGate && (
                          <div className="relative">
                            <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[var(--color-bg)] pointer-events-none" />
                            <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]/60">
                              <p className="text-base font-medium text-[var(--color-text)] mb-2">
                                Pause and reflect on what you just read
                              </p>
                              <p className="text-sm text-[var(--color-text-subtle)] mb-8 max-w-md text-center">
                                Test your understanding before continuing, or skip ahead if you prefer.
                              </p>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleExpandCheckpoint(checkpointIdxForThis)}
                                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors shadow-sm text-sm"
                                >
                                  Check Understanding
                                </button>
                                <button
                                  onClick={handleSkipCheckpoint}
                                  className="text-sm font-medium text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors underline underline-offset-2 decoration-dotted"
                                >
                                  Skip & Continue
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Questions — single render path, stays mounted once shown */}
                        {showQuestions && (
                          <div className={cn(
                            "transition-opacity duration-300",
                            isPastCheckpoint && !isCurrentCheckpoint && "opacity-70 hover:opacity-100"
                          )}>
                            <div className="flex items-center gap-4 mb-8 mt-4">
                              <div className="h-px bg-[var(--color-border)] flex-1" />
                              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                                Checkpoint
                              </span>
                              <div className="h-px bg-[var(--color-border)] flex-1" />
                            </div>
                            <div className="space-y-8">
                              {questionsAfterThis.map(q => (
                                <InlineQuestionCard
                                  key={q.id}
                                  question={q}
                                  onCompleted={() => handleQuestionAnswered(q.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              );
            })}
          </div>

          {/* Subtle scroll hint when text is gated */}
          {checkPoints.length > 0 && currentCheckpointIdx < checkPoints.length && (
            <div className="flex justify-center mt-4 animate-bounce text-[var(--color-text-subtle)]/40">
              <ChevronDown size={20} />
            </div>
          )}
        </div>

        {/* Summary + Vocabulary + Phrases (visible when analysis is on) */}
        <AnimatePresence>
          {analysisMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mt-24 pt-12 border-t border-[var(--color-border)]">
                <ArticleSummary article={article} initialSavedWords={initialSavedWords} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Timer Pill */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-[var(--color-bg)]/90 backdrop-blur-md border border-[var(--color-border)] rounded-full shadow-lg">
          <div className="px-3 text-sm font-mono font-medium text-[var(--color-text)]">
            {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, "0")}
          </div>
          <button
            onClick={() => setIsReading(!isReading)}
            className="p-2 rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors text-[var(--color-text)]"
          >
            {isReading ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={async () => {
               setIsCompleted(true);
               setIsReading(false);
               setAnalysisMode(true);
               await markArticleAsRead(article.slug, secondsElapsed);
            }}
            disabled={isCompleted || secondsElapsed < 60}
            className="ml-2 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={secondsElapsed < 60 ? "Read for at least 60 seconds to log" : "Log this reading session"}
          >
            {isCompleted ? "Logged" : "Mark Read"}
          </button>
        </div>
      </main>
    </ImmersiveShell>
  );
}
