"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, ArrowRight, FileText } from "lucide-react";
import { parseBulkMarkdown, BulkParsedPassage } from "@/lib/ingestion/parsers/bulk-parser";

type Option = {
  key: "A" | "B" | "C" | "D";
  text: string;
  explanation: string;
};

type Question = {
  prompt: string;
  correctOptionKey: "A" | "B" | "C" | "D";
  options: Option[];
};

export default function AdminImportRC() {
  // Mode State
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Metadata State
  const [examType, setExamType] = useState("CAT");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [slot, setSlot] = useState("Slot 1");

  // Single Mode State
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Bulk Mode State
  const [bulkText, setBulkText] = useState("");
  const [bulkPassages, setBulkPassages] = useState<BulkParsedPassage[]>([]);
  const [isParsingBulk, setIsParsingBulk] = useState(false);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [recentPassages, setRecentPassages] = useState<any[]>([]);

  useEffect(() => {
    loadRecentPassages();
  }, []);

  const loadRecentPassages = async () => {
    try {
      const res = await fetch("/api/admin/recent-passages");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRecentPassages(json.data ?? []);
    } catch (error) {
      console.error("Failed to load recent passages:", error);
    }
  };



  const handleBulkParse = () => {
    setIsParsingBulk(true);
    try {
      const parsed = parseBulkMarkdown(bulkText);
      setBulkPassages(parsed);
      if (parsed.length === 0) {
        alert("No passages found. Please check your markdown format.");
      }
    } catch (e) {
      alert("Failed to parse bulk text.");
      console.error(e);
    } finally {
      setIsParsingBulk(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setBulkText(ev.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSingle = async () => {
    if (!passage || questions.length === 0) {
      alert("Passage and parsed questions are required.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/import-rc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, year, slot, passage, questions }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      if (json.success) {
        alert("Passage saved successfully!");
        setPassage(""); setQuestions([]);
        loadRecentPassages();
      }
    } catch (e) {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBulk = async () => {
    if (bulkPassages.length === 0) {
      alert("No parsed passages to save.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/import-rc-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, year, slot, passages: bulkPassages }),
      });
      if (!res.ok) throw new Error("Bulk save failed");
      const json = await res.json();
      if (json.success) {
        alert(`Successfully saved ${json.count} passages!`);
        setBulkText(""); setBulkPassages([]);
        loadRecentPassages();
      }
    } catch (e) {
      alert("Failed to save bulk passages.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (passageId: string) => {
    if (!confirm("Are you sure you want to delete this passage? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/delete-rc", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      loadRecentPassages();
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const updateQuestion = (qIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = { ...updated[qIndex].options[oIndex], [field]: value };
    setQuestions(updated);
  };

  const addBlankQuestion = () => {
    setQuestions([...questions, {
      prompt: "", correctOptionKey: "A",
      options: [
        { key: "A", text: "", explanation: "" },
        { key: "B", text: "", explanation: "" },
        { key: "C", text: "", explanation: "" },
        { key: "D", text: "", explanation: "" }
      ]
    }]);
  };

  // Bulk Mode Updates
  const updateBulkPassage = (pIdx: number, value: string) => {
    const updated = [...bulkPassages];
    updated[pIdx].passageText = value;
    setBulkPassages(updated);
  };

  const updateBulkQuestion = (pIdx: number, qIdx: number, field: string, value: any) => {
    const updated = [...bulkPassages];
    updated[pIdx].questions[qIdx] = { ...updated[pIdx].questions[qIdx], [field]: value };
    setBulkPassages(updated);
  };

  const updateBulkOption = (pIdx: number, qIdx: number, oIdx: number, field: string, value: any) => {
    const updated = [...bulkPassages];
    updated[pIdx].questions[qIdx].options[oIdx] = { ...updated[pIdx].questions[qIdx].options[oIdx], [field]: value };
    setBulkPassages(updated);
  };

  const deleteBulkPassage = (pIdx: number) => {
    setBulkPassages(bulkPassages.filter((_, i) => i !== pIdx));
  };

  const deleteBulkQuestion = (pIdx: number, qIdx: number) => {
    const updated = [...bulkPassages];
    updated[pIdx].questions = updated[pIdx].questions.filter((_, i) => i !== qIdx);
    setBulkPassages(updated);
  };

  const addBlankBulkQuestion = (pIdx: number) => {
    const updated = [...bulkPassages];
    updated[pIdx].questions.push({
      prompt: "", correctOptionKey: "A",
      options: [
        { key: "A", text: "", explanation: "" },
        { key: "B", text: "", explanation: "" },
        { key: "C", text: "", explanation: "" },
        { key: "D", text: "", explanation: "" }
      ]
    });
    setBulkPassages(updated);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-text)] mb-2">Import RC Passages</h1>
          <p className="text-[var(--color-text-subtle)]">Import reading comprehension passages individually or via bulk markdown upload.</p>
        </div>
        <div className="flex gap-4">
          {mode === "single" ? (
            <button
              onClick={handleSaveSingle}
              disabled={isSaving || !passage || questions.length === 0}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Passage
            </button>
          ) : (
            <button
              onClick={handleSaveBulk}
              disabled={isSaving || bulkPassages.length === 0}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save All Passages
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: Metadata */}
        <section className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">1. Metadata (Persists between saves)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-subtle)] mb-1">Passage Category (Exam Type)</label>
              <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="CAT">CAT PYQ</option>
                <option value="XAT">XAT PYQ</option>
                <option value="SNAP">SNAP PYQ</option>
                <option value="NMAT">NMAT PYQ</option>
                <option value="CUSTOM">Normal Practice RC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-subtle)] mb-1">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="0">Unknown Year</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-subtle)] mb-1">Slot</label>
              <select value={slot} onChange={e => setSlot(e.target.value)} className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="">Unknown Slot</option>
                <option>Slot 1</option><option>Slot 2</option><option>Slot 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Mode Switcher */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${mode === "single" ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}
            onClick={() => setMode("single")}
          >
            Single Passage Import
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${mode === "bulk" ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}
            onClick={() => setMode("bulk")}
          >
            Bulk Markdown Import
          </button>
        </div>

        {mode === "single" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Single Mode Content */}
            <section className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Passage Text</h2>
              <textarea
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="Paste the full passage text here..."
                className="w-full flex-1 min-h-[500px] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-sm text-[var(--color-text)] leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </section>

            <section className="flex flex-col gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-[var(--color-text)] mb-1">Manual Questions ({questions.length})</h3>
                    <p className="text-sm text-[var(--color-text-subtle)]">Add questions manually and provide explanations for each option.</p>
                  </div>
                  <button onClick={addBlankQuestion} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <Plus size={16} /> Add Question
                  </button>
                </div>
                
                {questions.length === 0 && (
                  <div className="text-center py-12 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] border-dashed rounded-2xl">
                    <p className="text-[var(--color-text-subtle)] mb-4">No questions added yet.</p>
                    <button onClick={addBlankQuestion} className="bg-white border border-[var(--color-border)] hover:border-emerald-500 hover:text-emerald-600 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                      Add First Question
                    </button>
                  </div>
                )}
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-semibold text-stone-600 text-sm">
                          {qIdx + 1}
                        </span>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-rose-400 hover:text-rose-600 p-1">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <textarea
                        value={q.prompt}
                        onChange={e => updateQuestion(qIdx, "prompt", e.target.value)}
                        className="w-full p-3 mb-6 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                      />
                      <div className="space-y-4 pl-4 md:pl-8">
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.key} className={`p-4 rounded-xl border transition-colors ${q.correctOptionKey === opt.key ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-hover)]'}`}>
                            <div className="flex items-start gap-4 mb-3">
                              <input
                                type="radio"
                                checked={q.correctOptionKey === opt.key}
                                onChange={() => updateQuestion(qIdx, "correctOptionKey", opt.key)}
                                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="font-bold text-[var(--color-text-subtle)] mt-0.5">{opt.key})</span>
                              <textarea
                                value={opt.text}
                                onChange={e => updateOption(qIdx, oIdx, "text", e.target.value)}
                                className="flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:border-emerald-500 outline-none text-sm text-[var(--color-text)] resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="ml-12">
                              <textarea
                                value={opt.explanation}
                                onChange={e => updateOption(qIdx, oIdx, "explanation", e.target.value)}
                                placeholder="Explanation..."
                                className="w-full p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
            </section>
          </div>
        )}

        {mode === "bulk" && (
          <section className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Bulk Import Markdown</h2>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[var(--color-text-subtle)] mb-2">Upload Markdown / Text File</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Or paste the full bulk markdown here..."
              className="w-full min-h-[300px] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-sm text-[var(--color-text)] leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 resize-y mb-4"
            />

            <button
              onClick={handleBulkParse}
              disabled={isParsingBulk || !bulkText.trim()}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 px-8 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-8"
            >
              {isParsingBulk ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              Preview Bulk Parse
            </button>

            {bulkPassages.length > 0 && (
              <div className="space-y-12">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-serif text-emerald-900 mb-1">Bulk Parse Successful!</h3>
                    <p className="text-emerald-700 font-medium">Ready to import {bulkPassages.length} passages with a total of {bulkPassages.reduce((acc, p) => acc + p.questions.length, 0)} questions.</p>
                  </div>
                  <button
                    onClick={handleSaveBulk}
                    disabled={isSaving}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-colors"
                  >
                    Save All {bulkPassages.length} Passages
                  </button>
                </div>

                {bulkPassages.map((p, pIdx) => (
                  <div key={pIdx} className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--color-border)]">
                      <h4 className="text-xl font-serif font-bold text-[var(--color-text)] flex items-center gap-3">
                        <span className="bg-stone-100 text-stone-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">{pIdx + 1}</span>
                        Passage {pIdx + 1}
                      </h4>
                      <button onClick={() => deleteBulkPassage(pIdx)} className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete Passage
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <h5 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">Passage Text</h5>
                        <textarea
                          value={p.passageText}
                          onChange={(e) => updateBulkPassage(pIdx, e.target.value)}
                          className="w-full flex-1 min-h-[400px] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-sm text-[var(--color-text)] leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">Questions ({p.questions.length})</h5>
                          <button onClick={() => addBlankBulkQuestion(pIdx)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <Plus size={16} /> Add Blank
                          </button>
                        </div>

                        {p.questions.map((q, qIdx) => (
                          <div key={qIdx} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <span className="font-bold text-stone-500 text-sm">Q{qIdx + 1}</span>
                              <button onClick={() => deleteBulkQuestion(pIdx, qIdx)} className="text-rose-400 hover:text-rose-600">
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <textarea
                              value={q.prompt}
                              onChange={e => updateBulkQuestion(pIdx, qIdx, "prompt", e.target.value)}
                              className="w-full p-3 mb-5 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text)] rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                              rows={2}
                            />

                            <div className="space-y-3 pl-2 border-l-2 border-stone-100">
                              {q.options.map((opt, oIdx) => (
                                <div key={opt.key} className={`p-3 rounded-lg border transition-colors ${q.correctOptionKey === opt.key ? 'border-emerald-500 bg-emerald-50' : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)]'}`}>
                                  <div className="flex items-start gap-3 mb-2">
                                    <input
                                      type="radio"
                                      name={`correct-option-bulk-${pIdx}-${qIdx}`}
                                      checked={q.correctOptionKey === opt.key}
                                      onChange={() => updateBulkQuestion(pIdx, qIdx, "correctOptionKey", opt.key)}
                                      className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="font-bold text-[var(--color-text-subtle)] mt-0.5">{opt.key})</span>
                                    <textarea
                                      value={opt.text}
                                      onChange={e => updateBulkOption(pIdx, qIdx, oIdx, "text", e.target.value)}
                                      className="flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md focus:border-emerald-500 outline-none text-sm text-[var(--color-text)] resize-none"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="ml-10">
                                    <textarea
                                      value={opt.explanation}
                                      onChange={e => updateBulkOption(pIdx, qIdx, oIdx, "explanation", e.target.value)}
                                      placeholder="Explanation..."
                                      className="w-full p-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-xs outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent Passages */}
        {recentPassages.length > 0 && (
          <section className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mt-12">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">Recently Saved Passages</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--color-text-subtle)] uppercase bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Title</th>
                    <th className="px-4 py-3">Exam/Year/Slot</th>
                    <th className="px-4 py-3">Questions</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {recentPassages.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                      <td className="px-4 py-4 font-medium text-[var(--color-text)]">{p.title}</td>
                      <td className="px-4 py-4 text-[var(--color-text-subtle)]">{p.examType} {p.year} {p.slot}</td>
                      <td className="px-4 py-4 text-[var(--color-text-subtle)]">{p.questionCount}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete passage"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
