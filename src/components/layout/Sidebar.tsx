"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookOpenText,
  Brain,
  CalendarCheck,
  PenLine,
  GraduationCap,
  BarChart3,
  BookMarked,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Daily desk", icon: CalendarCheck, hint: "Streaks, focus and tasks" },
  { href: "/reading", label: "Deep reading", icon: BookOpenText, hint: "Slow paragraph training" },
  { href: "/grammar", label: "Grammar", icon: PenLine, hint: "Rules, drills and mistakes" },
  { href: "/rc", label: "CAT RC", icon: GraduationCap, hint: "Timed inference practice" },
  { href: "/vocabulary", label: "My Words", icon: BookMarked, hint: "Saved vocabulary" },
  { href: "/progress", label: "Progress", icon: BarChart3, hint: "Mastery and analytics" },
];

const adminItems = [
  { href: "/admin/articles", label: "Manage Articles" },
  { href: "/admin/import", label: "Import Essay" },
  { href: "/admin/import-rc", label: "Import CAT RC" },
];

// Hardcoded CAT 2026 exam date: Nov 29, 2026
const CAT_EXAM_DATE = new Date("2026-11-29T00:00:00+05:30");

function getDaysUntilCAT(): number {
  const now = new Date();
  const diff = CAT_EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState(getDaysUntilCAT);

  // Update countdown at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      setDaysLeft(getDaysUntilCAT());
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-6">
        <div
          className="grid size-9 place-items-center rounded-lg"
          style={{ backgroundColor: "rgba(90, 184, 168, 0.15)" }}
        >
          <Brain size={20} style={{ color: "#5ab8a8" }} />
        </div>
        <span
          className="text-xl tracking-tight"
          style={{
            fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
            color: "#fafafa",
          }}
        >
          AstraRead
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        <p
          className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.15em]"
          style={{ color: "#71717a" }}
        >
          Learn
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "active" : ""}`}
              title={item.hint}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto" style={{ opacity: 0.5 }} />
              )}
            </Link>
          );
        })}

        {/* Admin section */}
        <div className="mt-6">
          <p
            className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "#71717a" }}
          >
            Admin
          </p>
          {adminItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? "active" : ""}`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom: CAT Countdown */}
      <div className="border-t px-4 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: "rgba(90, 184, 168, 0.08)" }}
        >
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "#71717a" }}
          >
            CAT 2026
          </p>
          <p
            className="mt-1 text-2xl font-semibold"
            style={{
              fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
              color: "#fafafa",
            }}
          >
            {daysLeft} <span className="text-sm font-normal" style={{ color: "#a1a1aa" }}>days left</span>
          </p>
          <p className="mt-1 text-xs" style={{ color: "#71717a" }}>
            Nov 29, 2026
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 grid size-10 place-items-center rounded-lg lg:hidden"
        style={{
          backgroundColor: "var(--color-bg-sidebar)",
          color: "#fafafa",
          boxShadow: "var(--shadow-md)",
        }}
        aria-label="Open menu"
        id="sidebar-mobile-toggle"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--color-bg-sidebar)" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-5 grid size-8 place-items-center rounded-md"
          style={{ color: "#a1a1aa" }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0"
        style={{ backgroundColor: "var(--color-bg-sidebar)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
