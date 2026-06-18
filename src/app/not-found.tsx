import Link from "next/link";
import { BookOpenText, GraduationCap, Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 theme-dark:from-emerald-950/30 theme-dark:to-emerald-900/20">
          <BookOpenText size={36} className="text-emerald-600 theme-dark:text-emerald-400" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-[var(--color-text)] font-serif mb-3">404</h1>
        <p className="text-lg font-medium text-[var(--color-text)] mb-2">
          Page not found
        </p>
        <p className="text-sm text-[var(--color-text-subtle)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { href: "/reading", icon: BookOpenText, label: "Reading" },
            { href: "/rc", icon: GraduationCap, label: "RC Practice" },
            { href: "/grammar", icon: Sparkles, label: "Grammar" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-[var(--color-text-subtle)] hover:border-emerald-500/30 hover:text-emerald-600 transition-all duration-200"
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Back Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-950 theme-dark:bg-white theme-dark:text-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 theme-dark:hover:bg-emerald-100"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
