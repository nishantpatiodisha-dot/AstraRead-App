"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, ArrowRight, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";

const PARAGRAPH_FUNCTIONS = [
  "Introduction",
  "New topic",
  "Expansion",
  "Expansion with example",
  "Key insight",
  "Conclusion",
  "Counterargument",
  "Summary",
];

type InlineQuestionDraft = {
  id: string;
  insertAfterParagraph: number;
  prompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
};

export default function AdminImportPage() {
  const router = useRouter();
  
  // State: Wizard Step
  const [step, setStep] = useState<1 | 2>(1);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  // --- Step 1 State ---
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [questions, setQuestions] = useState<InlineQuestionDraft[]>([]);
  const [newParagraphText, setNewParagraphText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [loading1, setLoading1] = useState(false);
  const [error1, setError1] = useState<string | null>(null);

  // --- Step 2 State ---
  const [paragraphAnalysis, setParagraphAnalysis] = useState<
    Record<number, { function: string; centralIdea: string; explanation: string }>
  >({});
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState("");
  const [vocabulary, setVocabulary] = useState<{ term: string; meaning: string }[]>([]);
  const [newPhrases, setNewPhrases] = useState<{ term: string; meaning: string }[]>([]);

  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);

  // --- Handlers: Step 1 ---
  const handleAddParagraph = () => {
    if (!newParagraphText.trim()) return;
    setParagraphs([...paragraphs, newParagraphText.trim()]);
    setNewParagraphText("");
  };

  const handleUpdateParagraph = (idx: number, text: string) => {
    const newParas = [...paragraphs];
    newParas[idx] = text;
    setParagraphs(newParas);
  };

  const handleDeleteParagraph = (idx: number) => {
    setParagraphs(paragraphs.filter((_, i) => i !== idx));
    setQuestions(questions.filter(q => q.insertAfterParagraph !== idx).map(q => ({
      ...q,
      insertAfterParagraph: q.insertAfterParagraph > idx ? q.insertAfterParagraph - 1 : q.insertAfterParagraph
    })));
  };

  const handleAddQuestionClick = (paraIndex: number) => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        insertAfterParagraph: paraIndex,
        prompt: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      },
    ]);
  };

  const updateQuestion = (qId: string, updates: Partial<InlineQuestionDraft>) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)));
  };

  const updateOption = (qId: string, optIndex: number, val: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const newOpts = [...q.options] as [string, string, string, string];
          newOpts[optIndex] = val;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const deleteQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || paragraphs.length === 0) {
      setError1("Title and at least one paragraph are required.");
      return;
    }

    const invalidQ = questions.find((q) => !q.prompt || !q.correctAnswer || q.options.some((o) => !o));
    if (invalidQ) {
      setError1("Please complete all fields for your inline questions.");
      return;
    }

    setLoading1(true);
    setError1(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, paragraphs, inlineQuestions: questions, difficulty }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save article");

      setSavedSlug(data.slug);
      
      // Initialize analysis state for each paragraph
      const initialAnalysis: Record<number, any> = {};
      paragraphs.forEach((_, i) => {
        initialAnalysis[i] = { function: "", centralIdea: "", explanation: "" };
      });
      setParagraphAnalysis(initialAnalysis);
      
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError1(err.message);
    } finally {
      setLoading1(false);
    }
  };

  // --- Handlers: Step 2 ---
  const updateParaAnalysis = (idx: number, field: string, value: string) => {
    setParagraphAnalysis({
      ...paragraphAnalysis,
      [idx]: { ...paragraphAnalysis[idx], [field]: value }
    });
  };

  const handleSaveStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedSlug) return;

    setLoading2(true);
    setError2(null);

    try {
      const analysisPayload = {
        paragraphs: paragraphs.map((_, i) => ({
          position: i,
          // Map form fields to the DB column names used by the API
          simplifiedMeaning: paragraphAnalysis[i]?.explanation || "",
          purpose: paragraphAnalysis[i]?.function || "",
          keyIdea: paragraphAnalysis[i]?.centralIdea || "",
        })),
        summary,
        tone,
        vocabulary,
        newPhrases,
      };

      const res = await fetch(`/api/admin/articles/${savedSlug}/analyze`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save analysis");

      router.push("/admin/articles");
    } catch (err: any) {
      setError2(err.message);
    } finally {
      setLoading2(false);
    }
  };

  // --- Reusable term+meaning list builder ---
  const TermMeaningList = ({
    items,
    setItems,
    termPlaceholder = "Word/Phrase",
    meaningPlaceholder = "Meaning in context",
    emptyMessage = "None added yet.",
    addLabel = "Add",
  }: {
    items: { term: string; meaning: string }[];
    setItems: (items: { term: string; meaning: string }[]) => void;
    termPlaceholder?: string;
    meaningPlaceholder?: string;
    emptyMessage?: string;
    addLabel?: string;
  }) => (
    <div className="space-y-3">
      {items.map((v, i) => (
        <div key={i} className="flex gap-3">
          <input
            type="text"
            value={v.term}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], term: e.target.value };
              setItems(updated);
            }}
            className="w-1/3 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder={termPlaceholder}
          />
          <input
            type="text"
            value={v.meaning}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], meaning: e.target.value };
              setItems(updated);
            }}
            className="flex-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder={meaningPlaceholder}
          />
          <button
            type="button"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
            className="text-red-400 hover:text-red-600 px-2"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-stone-400 italic">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Import Article</h1>
          <p className="text-[var(--color-text-subtle)]">
            Step {step} of 2: {step === 1 ? "Build Content" : "Deep Analysis"}
          </p>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleSaveStep1} className="space-y-8">
          {error1 && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error1}</div>}

          <div className="bg-[var(--color-bg)] p-6 rounded-xl border shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Article Title *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-3 text-lg font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full md:w-1/2 border rounded-lg p-3 text-lg font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--color-bg-subtle)]"
              >
                <option value="easy">Easy</option>
                <option value="medium">CAT Level</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-semibold text-xl">Paragraphs</h2>
            
            {paragraphs.map((para, idx) => {
              const paraQuestions = questions.filter((q) => q.insertAfterParagraph === idx);

              return (
                <div key={idx} className="relative group space-y-4">
                  <div className="bg-[var(--color-bg)] p-5 rounded-xl border shadow-sm relative">
                    <div className="absolute -left-3 -top-3 bg-stone-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                      {idx + 1}
                    </div>
                    <textarea
                      value={para}
                      onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                      className="w-full bg-transparent border-none p-0 outline-none resize-none font-serif text-[15px] leading-relaxed"
                      rows={Math.max(3, para.split("\n").length)}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteParagraph(idx)}
                      className="absolute right-4 top-4 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Inline Question blocks */}
                  {paraQuestions.map((q, qIdx) => (
                    <div key={q.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm ml-8 relative">
                      <div className="absolute -left-4 -top-3 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                        Q{paraQuestions.length > 1 ? qIdx + 1 : ""}
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Inline Question{paraQuestions.length > 1 ? ` ${qIdx + 1}` : ""}</span>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(q.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Type your question here..."
                        value={q.prompt}
                        onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                        className="w-full bg-[var(--color-bg)] border rounded-lg p-2.5 mb-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                      />

                      <div className="space-y-2 mb-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctAnswer === opt && opt !== ""}
                              onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                              className="flex-1 bg-[var(--color-bg)] border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <textarea
                        placeholder="Explanation (Optional) - Revealed after answering"
                        value={q.explanation}
                        onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                        className="w-full bg-[var(--color-bg)] border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        rows={2}
                      />
                    </div>
                  ))}

                  {/* Always show Add Question button */}
                  <div className={`flex justify-center -my-2 relative z-10 transition-opacity ${paraQuestions.length === 0 ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionClick(idx)}
                      className="bg-white border shadow-sm text-stone-400 hover:text-emerald-600 hover:border-emerald-200 rounded-full py-1.5 px-4 text-xs font-medium flex items-center gap-1 transition-all"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add new paragraph */}
            <div className="bg-[var(--color-bg-subtle)] p-5 rounded-xl border border-dashed border-stone-300">
              <textarea
                value={newParagraphText}
                onChange={(e) => setNewParagraphText(e.target.value)}
                placeholder="Paste the next paragraph here..."
                className="w-full bg-transparent border-none p-0 outline-none resize-none font-serif text-[15px] leading-relaxed mb-3"
                rows={4}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddParagraph}
                  disabled={!newParagraphText.trim()}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  Add Paragraph
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading1}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg text-white font-medium py-3 px-8 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading1 ? "Saving..." : "Save & Continue to Analysis"} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 2: DEEP ANALYSIS                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={handleSaveStep2} className="space-y-10">
          {error2 && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error2}</div>}

          {/* ─── Overall Analysis ─── */}
          <section className="space-y-6">
            <h2 className="font-semibold text-xl border-b pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Overall Analysis
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Summary of the Passage *</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full border rounded-lg p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
                rows={6}
                placeholder="Comprehensive summary of the passage — what it argues, how the argument is built, and what conclusions are drawn..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tone *</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Analytical, Critical, Persuasive, Reflective"
              />
            </div>
          </section>

          {/* ─── Paragraph-wise Explanation ─── */}
          <section className="space-y-6">
            <h2 className="font-semibold text-xl border-b pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Paragraph-wise Explanation
            </h2>
            <p className="text-sm text-[var(--color-text-subtle)] -mt-2">
              For each paragraph, specify its structural function, one-sentence central idea, and a detailed explanation of what it does in context.
            </p>
            
            {paragraphs.map((para, idx) => (
              <div key={idx} className="bg-[var(--color-bg)] rounded-xl border shadow-sm overflow-hidden">
                {/* Paragraph text preview */}
                <div className="p-5 bg-[var(--color-bg-subtle)] border-b relative">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-stone-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow shrink-0">
                      {idx + 1}
                    </span>
                    {paragraphAnalysis[idx]?.function && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {paragraphAnalysis[idx]?.function}
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
                    {para.length > 300 ? para.substring(0, 300) + "…" : para}
                  </p>
                </div>

                {/* Analysis fields */}
                <div className="p-5 space-y-4">
                  {/* Function (dropdown with custom option) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                        Function
                      </label>
                      <div className="relative">
                        <input
                          list={`functions-${idx}`}
                          type="text"
                          value={paragraphAnalysis[idx]?.function || ""}
                          onChange={(e) => updateParaAnalysis(idx, "function", e.target.value)}
                          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--color-bg-subtle)]"
                          placeholder="e.g. Introduction"
                        />
                        <datalist id={`functions-${idx}`}>
                          {PARAGRAPH_FUNCTIONS.map(fn => (
                            <option key={fn} value={fn} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                        Central Idea (Main Focus)
                      </label>
                      <input
                        type="text"
                        value={paragraphAnalysis[idx]?.centralIdea || ""}
                        onChange={(e) => updateParaAnalysis(idx, "centralIdea", e.target.value)}
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-[var(--color-bg-subtle)]"
                        placeholder="One sentence capturing the main idea of this paragraph"
                      />
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                      Detailed Explanation
                    </label>
                    <textarea
                      value={paragraphAnalysis[idx]?.explanation || ""}
                      onChange={(e) => updateParaAnalysis(idx, "explanation", e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-[var(--color-bg-subtle)] leading-relaxed"
                      rows={3}
                      placeholder="What the author is doing in this paragraph, how it connects to the broader argument..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ─── Difficult Vocabulary ─── */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Difficult Vocabulary
              </h2>
              <button
                type="button"
                onClick={() => setVocabulary([...vocabulary, { term: "", meaning: "" }])}
                className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Word
              </button>
            </div>
            <p className="text-sm text-[var(--color-text-subtle)] -mt-2">
              Individual words that a reader may not know. Include a contextual definition.
            </p>
            <TermMeaningList
              items={vocabulary}
              setItems={setVocabulary}
              termPlaceholder="Word"
              meaningPlaceholder="Definition in context of this passage"
              emptyMessage="No difficult vocabulary added yet."
            />
          </section>

          {/* ─── New Words & Phrases ─── */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                New Words &amp; Phrases
              </h2>
              <button
                type="button"
                onClick={() => setNewPhrases([...newPhrases, { term: "", meaning: "" }])}
                className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Phrase
              </button>
            </div>
            <p className="text-sm text-[var(--color-text-subtle)] -mt-2">
              Multi-word phrases, idioms, or domain-specific expressions that may be unfamiliar.
            </p>
            <TermMeaningList
              items={newPhrases}
              setItems={setNewPhrases}
              termPlaceholder="Phrase"
              meaningPlaceholder="Meaning in context"
              emptyMessage="No new phrases added yet."
            />
          </section>

          {/* ─── Submit ─── */}
          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading2}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg text-white font-medium py-3 px-8 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading2 ? "Finishing..." : "Complete Import"} <CheckCircle2 size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
