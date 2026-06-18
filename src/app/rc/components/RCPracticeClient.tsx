"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import RCResultsView from "./RCResultsView";

type Option = {
  id: string;
  optionKey: string;
  text: string;
  explanation: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  prompt: string;
  tag: string;
  explanation: string | null;
  toneClues: string[] | null;
  trapWords: string[] | null;
  inferenceLogic: string | null;
  correctOptionKey: string;
  options: Option[];
};

type Passage = {
  id: string;
  title: string;
  passage: string;
  difficulty: string;
  estimatedMinutes: number;
  year: number;
  sourceLabel: string | null;
};

export default function RCPracticeClient({ passage, questions }: { passage: Passage; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [mode, setMode] = useState<"practice" | "timed">("timed");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fontZoom, setFontZoom] = useState(110);
  const [viewMode, setViewMode] = useState<"test" | "results">("test");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Load from sessionStorage if available (for after sign-in)
    const storedAnswers = sessionStorage.getItem(`rc_answers_${passage.id}`);
    if (storedAnswers) {
      try {
        const parsed = JSON.parse(storedAnswers);
        setAnswers(parsed.answers);
        setSecondsElapsed(parsed.time);
        setIsSubmitted(true);
        setViewMode("results");
        // Clear after loading
        sessionStorage.removeItem(`rc_answers_${passage.id}`);
      } catch (e) {}
    }
  }, [passage.id]);

  useEffect(() => {
    if (isSubmitted || mode === "practice") return;
    const interval = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, mode]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Are you sure you want to submit?")) return;
    }
    setIsSubmitted(true);
    setViewMode("results");

    if (!isSignedIn) {
      setShowSignInPrompt(true);
      // Store in session storage so it persists through sign in
      sessionStorage.setItem(`rc_answers_${passage.id}`, JSON.stringify({
        answers,
        time: secondsElapsed
      }));
      return; // Do not attempt to save to DB
    }

    // Save to DB (mocking the endpoint for now, will implement later if requested)
    try {
      await fetch('/api/rc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passageId: passage.id, answers, totalSeconds: secondsElapsed })
      });
    } catch (e) {
      console.error("Failed to save attempt");
    }
  };

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctOptionKey ? 1 : 0), 0);

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-border)] px-6 flex items-center justify-between bg-[var(--color-bg)] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/rc" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-semibold text-[var(--color-text)] leading-tight">{passage.title}</h1>
            <p className="text-xs text-[var(--color-text-subtle)]">CAT {passage.year} • {passage.sourceLabel}</p>
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
              <div className="flex bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg p-1 text-sm font-medium" role="tablist" aria-label="Practice mode">
                <button
                  role="tab"
                  aria-selected={mode === "timed"}
                  onClick={() => setMode("timed")}
                  className={`px-3 py-1.5 rounded-md transition-all ${mode === "timed" ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"}`}
                >
                  Timed
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "practice"}
                  onClick={() => setMode("practice")}
                  className={`px-3 py-1.5 rounded-md transition-all ${mode === "practice" ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"}`}
                >
                  Practice
                </button>
              </div>
            )}
          </div>

          {mode === "timed" && (
            <div className={`flex items-center gap-2 font-mono text-lg ${secondsElapsed > passage.estimatedMinutes * 60 ? 'text-rose-600' : 'text-[var(--color-text)]'}`} aria-live="off" aria-label={`Time elapsed: ${formatTime(secondsElapsed)}`}>
              <Clock size={18} aria-hidden="true" />
              {formatTime(secondsElapsed)}
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
              <div className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-semibold" aria-live="polite">
                Score: {score} / {questions.length}
              </div>
              {!isSignedIn && (
                <Link
                  href="/sign-up"
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-emerald-300"
                >
                  Sign in to Save
                </Link>
              )}
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
            passages={[{ id: passage.id, title: passage.title, questions }]}
            answers={answers}
            totalSeconds={secondsElapsed}
            onBackToPassage={() => setViewMode("test")}
          />
        ) : (
          <>
            {/* Left: Passage */}
            <div className="w-[60%] overflow-y-auto border-r border-[var(--color-border)] p-8 md:p-12 bg-[var(--color-bg-subtle)]">
          <div className="max-w-[70ch] mx-auto">
            <div 
              className="prose prose-stone dark:prose-invert font-reading prose-p:leading-[1.75] prose-p:mb-8 transition-all duration-300"
              style={{ fontSize: `${fontZoom}%` }}
            >
              {passage.passage.split('\n\n').map((para, i) => (
                <p key={i} className="mb-6">{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="w-[40%] flex flex-col bg-[var(--color-bg)]">
          <div className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="max-w-xl mx-auto space-y-16 pb-24">
              {questions.length > 0 && (() => {
                const qIdx = currentQuestionIndex;
                const q = questions[qIdx];
                const selected = answers[q.id];
                const isCorrect = selected === q.correctOptionKey;
                const isQuestionSubmitted = isSubmitted || (mode === "practice" && !!selected);

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
                      {q.options.map((opt) => {
                        const isSelected = selected === opt.optionKey;
                        const isCorrectOption = opt.optionKey === q.correctOptionKey;

                        let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ";

                        if (!isQuestionSubmitted) {
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
                              disabled={isQuestionSubmitted}
                              className={btnClass}
                            >
                              <span className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center text-xs font-bold ${!isQuestionSubmitted
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
                            {isQuestionSubmitted && opt.explanation && (
                              <div className="ml-6 mr-4 mt-2 p-3 bg-[var(--color-bg-subtle)] rounded-lg text-sm text-[var(--color-text-subtle)] border border-[var(--color-border)]">
                                {opt.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Question Level Explanation */}
                    {isQuestionSubmitted && (
                      <div className={`ml-12 mt-6 p-6 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                          <h4 className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isCorrect ? "Correct!" : "Incorrect"}
                          </h4>
                        </div>

                        {/* Content block for explanation, tone clues, trap words */}
                        {(q.explanation || (q.toneClues?.length ?? 0) > 0 || (q.trapWords?.length ?? 0) > 0) && (
                          <div className="prose prose-sm prose-stone dark:prose-invert max-w-none mt-2 pt-2 border-t border-[var(--color-border)]">
                            {q.explanation && <p className="text-[var(--color-text)] mb-0">{q.explanation}</p>}

                            {((q.toneClues?.length ?? 0) > 0 || (q.trapWords?.length ?? 0) > 0) && (
                              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                                {(q.toneClues?.length ?? 0) > 0 && (
                                  <div>
                                    <span className="block text-xs font-bold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">Tone Clues</span>
                                    <ul className="list-disc pl-4 space-y-1 text-[var(--color-text-subtle)]">
                                      {q.toneClues?.map((clue, i) => <li key={i}>{clue}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {(q.trapWords?.length ?? 0) > 0 && (
                                  <div>
                                    <span className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Trap Words</span>
                                    <ul className="list-disc pl-4 space-y-1 text-rose-500">
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
              })()}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-[var(--color-border)] p-6 bg-[var(--color-bg)] flex justify-between shrink-0">
            <button
              aria-label="Previous question"
              onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text)] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--color-text-subtle)]">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
                  className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
                >
                  Next Question
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

      {/* Sign In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg)] rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-[var(--color-border)] relative">
            <button 
              onClick={() => setShowSignInPrompt(false)}
              className="absolute top-4 right-4 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
            >
              <XCircle size={24} />
            </button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-3">
              Great attempt!
            </h2>
            <p className="text-[var(--color-text-subtle)] mb-8">
              You scored <strong>{score} out of {questions.length}</strong>. Sign in or create a free account to save your progress, track your accuracy over time, and unlock full analytics.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/sign-up"
                className="bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors w-full flex items-center justify-center gap-2"
              >
                Sign up to save progress
              </Link>
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="font-medium text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)] py-2"
              >
                Continue without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
