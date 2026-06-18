import Link from "next/link";
import { BookOpenText, Target, Brain, ArrowRight, Sparkles, GraduationCap, BarChart3, BookMarked } from "lucide-react";

export function LoggedOutDashboard() {
  const features = [
    {
      title: "Deep Reading",
      description: "Train your brain to decode dense philosophical and scientific essays paragraph by paragraph.",
      icon: BookOpenText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Reading Patterns",
      description: "Master connector words, tone shifts, and the invisible architecture of arguments.",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "CAT RC Practice",
      description: "Apply your skills to timed, exam-style inference and tone questions with deep analysis.",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  const modules = [
    { icon: BookOpenText, label: "Deep Reading", desc: "Paragraph-by-paragraph essay analysis", href: "/reading" },
    { icon: GraduationCap, label: "RC PYQs", desc: "Previous year CAT questions", href: "/rc" },
    { icon: Brain, label: "Grammar", desc: "Foundations & reading patterns", href: "/grammar" },
    { icon: BookMarked, label: "Vocabulary", desc: "Build your word bank", href: "/vocabulary" },
    { icon: BarChart3, label: "Progress", desc: "Track your improvement", href: "/progress" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 lg:py-16 px-2">
      {/* Hero */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-subtle)] mb-6">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          The premier CAT reading platform
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-text)] mb-6 tracking-tight">
          Read slowly.<br className="md:hidden" /> Think clearly.<br className="hidden md:block" /> Score higher.
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-subtle)] max-w-2xl mx-auto mb-10 leading-relaxed">
          AstraRead isn&apos;t just about answering questions. It&apos;s about fundamentally rewiring how you process complex text for the CAT exam.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/rc?tab=pyq" 
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Try Free — Attempt CAT PYQs
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 border-2 border-[var(--color-border)] text-[var(--color-text)] px-8 py-4 rounded-xl font-semibold text-lg hover:border-[var(--color-text)] transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <div key={i} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--color-border-hover)] transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${f.bg}`}>
              <f.icon className={`w-6 h-6 ${f.color}`} />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">{f.title}</h3>
            <p className="text-[var(--color-text-subtle)] leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* What's Inside */}
      <div className="mb-16">
        <h2 className="text-2xl font-serif font-bold text-[var(--color-text)] text-center mb-8">
          Everything you need to master VARC
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {modules.map((m, i) => (
            <Link
              key={i}
              href={m.href}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-center hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center">
                <m.icon className="w-5 h-5 text-[var(--color-text-subtle)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{m.label}</p>
                <p className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20 p-10">
        <h3 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-3">
          Start with last year&apos;s CAT PYQs
        </h3>
        <p className="text-[var(--color-text-subtle)] mb-6 max-w-lg mx-auto">
          No signup required. Attempt real CAT reading comprehension passages and see how you perform.
        </p>
        <Link 
          href="/rc?tab=pyq" 
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <GraduationCap className="w-5 h-5" />
          Start Practicing — Free
        </Link>
      </div>
    </div>
  );
}
