"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenText,
  BrainCircuit,
  ChevronDown,
  MessageCircle,
  PlusCircle,
  Check,
  Languages,
} from "lucide-react";
import type { Article, VocabEntry } from "../data/articles";
import { saveVocabulary, unsaveVocabulary } from "@/app/actions";

function VocabGrid({ items, savedWords, onToggleSave }: { items: VocabEntry[]; savedWords: Set<string>; onToggleSave: (term: string, meaning: string, isSaved: boolean) => void }) {
  if (items.length === 0) return <p className="text-sm text-stone-400 italic">None added.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((v, idx) => {
        const isSaved = savedWords.has(v.term);
        return (
          <div key={idx} className="flex flex-col justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div>
              <strong className="text-[var(--color-text)] block mb-1">{v.term}</strong>
              <span className="text-sm text-[var(--color-text-subtle)] block mb-3">{v.meaning}</span>
            </div>
            <button
              onClick={() => onToggleSave(v.term, v.meaning, isSaved)}
              className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors group ${isSaved
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
                  : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                }`}
            >
              {isSaved ? (
                <>
                  <Check size={14} className="group-hover:hidden" />
                  <span className="group-hover:hidden">Saved</span>
                  <span className="hidden group-hover:block">Unsave</span>
                </>
              ) : (
                <>
                  <PlusCircle size={14} /> Save
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function ArticleSummary({ article, initialSavedWords = [] }: { article: Article, initialSavedWords?: string[] }) {
  const [openSection, setOpenSection] = useState<string | null>("central-ideas");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set(initialSavedWords));

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleToggleVocab = async (term: string, meaning: string, isCurrentlySaved: boolean) => {
    if (isCurrentlySaved) {
      setSavedWords(prev => {
        const next = new Set(prev);
        next.delete(term);
        return next;
      });
      try {
        await unsaveVocabulary({ term });
      } catch (e) {
        console.error(e);
        setSavedWords(prev => new Set(prev).add(term));
      }
    } else {
      setSavedWords(prev => new Set(prev).add(term));
      try {
        await saveVocabulary({
          term,
          meaning,
          sourceArticleId: article.slug,
        });
      } catch (e) {
        console.error(e);
        setSavedWords(prev => {
          const next = new Set(prev);
          next.delete(term);
          return next;
        });
      }
    }
  };

  const sections = [
    {
      id: "central-ideas",
      icon: BrainCircuit,
      label: "Summary & Tone",
      content: (
        <div className="text-[var(--color-text)] space-y-4">
          {article.overallSummary && <p className="leading-relaxed">{article.overallSummary}</p>}
          {article.toneOfPassage && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Tone:</span>
              <span className="text-sm font-medium">{article.toneOfPassage}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "vocabulary",
      icon: BookOpenText,
      label: "Difficult Vocabulary",
      content: (
        <VocabGrid items={article.difficultVocabulary} savedWords={savedWords} onToggleSave={handleToggleVocab} />
      ),
    },
    {
      id: "phrases",
      icon: Languages,
      label: "New Words & Phrases",
      content: (
        <VocabGrid items={article.newPhrases} savedWords={savedWords} onToggleSave={handleToggleVocab} />
      ),
    },
  ];

  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-8">
      <h3 className="text-xl font-bold font-serif text-[var(--color-text)] mb-6">
        Deep Analysis
      </h3>

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-bg)] transition-colors hover:border-[var(--color-border-hover)]"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOpen ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--color-bg-subtle)] text-[var(--color-text-subtle)]"}`}>
                    <section.icon size={18} />
                  </div>
                  <span className="font-semibold text-[var(--color-text)]">{section.label}</span>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-[var(--color-text-subtle)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-[var(--color-border)] border-opacity-50">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
