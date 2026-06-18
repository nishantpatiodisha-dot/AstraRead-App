import { getDb } from "@/db";
import { rcPassages, rcQuestions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Clock, GraduationCap, ChevronRight } from "lucide-react";
import HubShell from "@/components/layout/HubShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAT RC Practice — PYQs & Daily Passages",
  description: "Practice CAT VARC reading comprehension with previous year questions and daily passages. Detailed per-option explanations, trap word identification, and inference logic.",
};

export const dynamic = 'force-dynamic';

export default async function RCIndexPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string, year?: string }>;
}) {
  const db = getDb();
  const { tab, year: selectedYear } = await searchParams;
  const activeTab = tab === "daily" ? "daily" : "pyq";
  
  // Fetch passages based on active tab
  let passages;
  if (activeTab === "daily") {
    passages = await db
      .select()
      .from(rcPassages)
      .where(eq(rcPassages.examType, "CUSTOM"))
      .orderBy(desc(rcPassages.createdAt));
  } else {
    passages = await db
      .select()
      .from(rcPassages)
      .where(eq(rcPassages.examType, "CAT"))
      .orderBy(desc(rcPassages.year), desc(rcPassages.sourceLabel));
  }

  // Also fetch question counts for each passage
  const allQuestions = await db.select({
    id: rcQuestions.id,
    passageId: rcQuestions.passageId
  }).from(rcQuestions);

  // Group by year, then by slot
  const groupedData: Record<string, Record<string, typeof passages>> = {};
  
  for (const passage of passages) {
    const yearStr = passage.year.toString();
    const slotStr = passage.slot || (passage.sourceLabel?.includes('Slot') ? passage.sourceLabel : "Slot Unspecified");
    
    if (!groupedData[yearStr]) groupedData[yearStr] = {};
    if (!groupedData[yearStr][slotStr]) groupedData[yearStr][slotStr] = [];
    
    groupedData[yearStr][slotStr].push(passage);
  }

  const sortedYears = Object.keys(groupedData).sort((a, b) => parseInt(b) - parseInt(a));
  const displayedYears = (selectedYear && selectedYear !== "all" && sortedYears.includes(selectedYear)) ? [selectedYear] : sortedYears;

  return (
    <HubShell title="RC Practice" icon={<GraduationCap className="w-5 h-5 text-[var(--color-text-subtle)]" />}>
      <div className="max-w-5xl mx-auto px-2 fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-6 border-b border-[var(--color-border)]" role="tablist" aria-label="RC content type">
            <Link 
              href={`?tab=pyq${selectedYear ? `&year=${selectedYear}` : ''}`} 
              role="tab"
              aria-selected={activeTab === 'pyq'}
              className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'pyq' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text)]'}`}
            >
              CAT PYQs
              {activeTab === 'pyq' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
              )}
            </Link>
            <Link 
              href={`?tab=daily${selectedYear ? `&year=${selectedYear}` : ''}`} 
              role="tab"
              aria-selected={activeTab === 'daily'}
              className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'daily' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text)]'}`}
            >
              Daily Practice RCs
              {activeTab === 'daily' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
              )}
            </Link>
          </div>
        </div>

        {activeTab === "daily" ? (
          <div className="space-y-4">
            {passages.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-subtle)]">
                No practice passages imported yet. Use the <Link href="/admin/import-rc" className="text-emerald-600 underline">Admin Import Tool</Link> to add some.
              </div>
            ) : (
              passages.map((passage, index) => {
                const qCount = allQuestions.filter(q => q.passageId === passage.id).length;
                // Since it's sorted desc, passages.length - index gives 1 for the oldest, N for the newest.
                const passageNumber = passages.length - index;
                
                return (
                  <Link 
                    key={passage.id}
                    href={`/rc/${passage.id}`}
                    className="group/link block p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-emerald-500/30 transition-all shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border
                            ${passage.difficulty === 'hard' ? 'text-rose-700 bg-rose-500/10 border-rose-500/20' : 
                              passage.difficulty === 'medium' ? 'text-amber-700 bg-amber-500/10 border-amber-500/20' : 
                              'text-blue-700 bg-blue-500/10 border-blue-500/20'}`}>
                            {passage.difficulty}
                          </span>
                          <span className="text-xs text-[var(--color-text-subtle)] font-medium">
                            Added {new Date(passage.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-[var(--color-text)] group-hover/link:text-emerald-600 theme-dark:group-hover/link:text-emerald-400 transition-colors">
                          RC Passage {passageNumber}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[var(--color-text-subtle)] text-sm font-medium shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {passage.estimatedMinutes} min
                        </div>
                        <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg flex items-center gap-1 group-hover/link:bg-emerald-500/10 group-hover/link:text-emerald-700 theme-dark:group-hover/link:text-emerald-400 transition-colors">
                          {qCount} Qs
                          <ChevronRight size={16} className="transform translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedYears.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-subtle)]">
                No passages imported yet. Use the <Link href="/admin/import-rc" className="text-emerald-600 underline">Admin Import Tool</Link> to add some.
              </div>
            ) : (
              <>
                {/* Year Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <Link 
                    href={`?tab=${activeTab}&year=all`} 
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${(!selectedYear || selectedYear === 'all') ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[var(--color-bg)] text-[var(--color-text-subtle)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'}`}
                  >
                    All Years
                  </Link>
                  {sortedYears.map(y => (
                    <Link 
                      key={y} 
                      href={`?tab=${activeTab}&year=${y}`} 
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${selectedYear === y ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[var(--color-bg)] text-[var(--color-text-subtle)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'}`}
                    >
                      {y === "0" ? "Misc" : y}
                    </Link>
                  ))}
                </div>

                {/* Displayed Passages by Year */}
                <div className="space-y-8">
                  {displayedYears.map((year) => (
                    <section key={year} className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
                      <div className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--color-text)] font-serif">{year === "0" ? "Uncategorised Passages" : `${activeTab === "pyq" ? "CAT " : "Practice "}${year}`}</h2>
                      </div>
                      
                      <div className="divide-y divide-[var(--color-border)]">
                        {Object.keys(groupedData[year]).sort().map(slotName => {
                          const slotPassages = groupedData[year][slotName];
                          const totalQuestions = slotPassages.reduce((sum, p) => sum + allQuestions.filter(q => q.passageId === p.id).length, 0);
                          const examType = slotPassages[0].examType;

                          return (
                            <div key={slotName} className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">{slotName}</h3>
                                  <p className="text-sm text-[var(--color-text-subtle)]">{slotPassages.length} Passages • {totalQuestions} Questions</p>
                                </div>
                                
                                {/* Slot-level test button */}
                                {slotPassages.length > 1 && (
                                  <Link
                                    href={`/rc/slot/${examType}/${year}/${encodeURIComponent(slotName)}`}
                                    className="bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity shadow-sm whitespace-nowrap text-center"
                                  >
                                    Take Full Slot Test
                                  </Link>
                                )}
                              </div>

                              <details className="group mt-4 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] p-4">
                                <summary className="cursor-pointer text-sm font-bold text-[var(--color-text-subtle)] uppercase tracking-wider hover:text-[var(--color-text)] transition-colors flex items-center gap-2 outline-none list-none marker:hidden">
                                  <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform text-[var(--color-text-subtle)]" />
                                  Attempt Single Passages
                                </summary>
                                <div className="grid gap-3 mt-5 ml-2 border-l-2 border-[var(--color-border)] pl-4">
                                  {slotPassages.map((passage) => {
                                    const qCount = allQuestions.filter(q => q.passageId === passage.id).length;
                                    
                                    return (
                                      <Link 
                                        key={passage.id}
                                        href={`/rc/${passage.id}`}
                                        className="group/link block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-emerald-500/30 transition-all shadow-sm"
                                      >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border
                                                ${passage.difficulty === 'hard' ? 'text-rose-700 bg-rose-500/10 border-rose-500/20' : 
                                                  passage.difficulty === 'medium' ? 'text-amber-700 bg-amber-500/10 border-amber-500/20' : 
                                                  'text-blue-700 bg-blue-500/10 border-blue-500/20'}`}>
                                                {passage.difficulty}
                                              </span>
                                            </div>
                                            <h4 className="text-[var(--color-text)] font-medium group-hover/link:text-emerald-600 theme-dark:group-hover/link:text-emerald-400 transition-colors">
                                              {passage.title}
                                            </h4>
                                          </div>
                                          
                                          <div className="flex items-center gap-4 text-[var(--color-text-subtle)] text-sm font-medium shrink-0">
                                            <div className="flex items-center gap-1.5">
                                              <Clock size={14} />
                                              {passage.estimatedMinutes} min
                                            </div>
                                            <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2.5 py-1 rounded-md flex items-center gap-1 group-hover/link:bg-emerald-500/10 group-hover/link:text-emerald-700 theme-dark:group-hover/link:text-emerald-400 transition-colors">
                                              {qCount} Qs
                                              <ChevronRight size={14} className="transform translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </details>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </HubShell>
  );
}
