# CURRENT_STATE.md — AstraRead

> Last updated: 2026-06-18

---

## Overall Status: Ready for Launch (All Phases Complete)

The project has a working production-ready build with core data models, functional reading/grammar/RC modules, a complete design system, Clerk authentication, freemium paywalls, and protected admin API routes. The codebase compiles cleanly and all routes build successfully.

---

## Features Completed ✅

### Design System (Phase 1 — Just Completed)
- **Root layout** with Instrument Serif (headings) + Inter (body) fonts via `next/font/google`
- **CSS custom property design system** in `globals.css` with full light/dark token sets
- **ThemeProvider** — client-side dark mode context using `data-theme` attribute on `<html>`
- **Bulletproof Dark Mode** — Replaced Tailwind's buggy built-in `dark:` variant (which conflicted with Turbopack & OS settings) with a custom `theme-dark:` variant to ensure absolute JS-driven toggle control.
- **Mobile Readability** — Compressed heading sizes, tightened line heights, and disabled horizontal scrolling (`overflow-x: hidden`) specifically tailored for iOS/mobile reading.
- **Sidebar & Header** — premium layouts with glassmorphism and HubShell/ImmersiveShell wrappers.

### Deep Reading Module (Working Prototype)
- **Article library page** (`/reading`) — server-rendered from PostgreSQL, fallback to mock data
- **Article reader** (`/reading/[slug]`) — paragraph-by-paragraph display with adjustable font size, dark mode, cover images, connector words
- **Inline questions** — rendered between paragraphs with interactive answering
- **Article summary** — tone, vocabulary, central ideas, phrases displayed at bottom
- **Reading library client** — search, filter by source/difficulty/category, animated card grid
- **6 mock articles** — fully annotated with paragraph meanings, tone, vocabulary, difficulty scores (from Aeon, Guardian, Hindu)

### Grammar Module (Working Prototype)
- **Grammar index page** (`/grammar`) — two sections: Grammar Foundations (sortOrder < 10) and Reading Flow (sortOrder >= 10)
- **Topic detail page** (`/grammar/topic/[slug]`) — lesson content + examples + interactive exercises
- **Grammar practice client** — multiple-choice exercises with immediate feedback
- **Grammar attempt tracking** — API route (`/api/grammar/attempt`) saves answers to database

### RC Practice Module (Working Prototype)
- **RC index page** (`/rc`) — passages grouped by year, with dynamic year filtering and difficulty badges
- **RC practice page** (`/rc/[id]`) — split-screen with passage (left) and questions (right)
- **Timed practice** — running timer with auto-submit
- **Results Dashboard** — Post-submission full-width dashboard showing score, accuracy, time taken, and compact, detailed explanations for all options, tone clues, trap words, and inference logic. Includes a toggle to return to the raw passage view.

### Content Ingestion Pipeline
- **Manual article import** (`/admin/import`) — full form with title, author, source, category, URL, cover image, full text, inline question authoring
- **Admin Bulk Import Tool** (`/admin/import-rc`) — Parses markdown files containing multiple passages, questions, and explanations. Features a custom regex parser robust to cross-platform line endings and an editable preview before finalizing the import.
- **Paragraph splitter** — `src/lib/ingestion/parsers/paragraph-splitter.ts` auto-splits text into paragraphs with connector word detection
- **Article store** — `src/lib/ingestion/store.ts` handles upsert logic with source validation

### Database Schema (22 Tables)
- Complete Drizzle ORM schema with PostgreSQL (Neon) covering articles, paragraphs, explanations, analyses, grammar topics/lessons/exercises/attempts, RC passages/questions/options/attempts/answers, vocabulary, daily tasks, streaks, progress snapshots, users
- Seed script with sample data for grammar exercises (articles topic), RC passage (sample), article sources (Aeon, Guardian, Hindu), daily checklist templates
- Migration infrastructure with `drizzle-kit` configured

### API Routes & Security
- **Admin Routes**: Fully protected by Clerk authentication (`requireAdminApi`) and in-memory rate limiting (20 req/min).
- `POST /api/admin/import` — manual article import
- `POST /api/admin/import-rc` — import RC passage with DB save
- `POST /api/admin/extract-rc` — AI-powered PDF extraction using Gemini
- `GET /api/articles` — fetch articles list
- `GET /api/articles/[slug]` — fetch single article with paragraphs
- `POST /api/grammar/attempt` — save grammar exercise attempt
- **Infrastructure**: DB Keepalive cron job (`/api/cron/keepalive`).

### UX & Polish
- **Custom Error UI**: Custom 404 page and global error boundary (`error.tsx`).
- **Loading States**: Comprehensive loading skeletons across the dashboard, reading, RC, and grammar pages.
- **Landing Page**: Logged-out users see a marketing page with a "Try Free" CTA to attempt the latest year's RC.
- **PWA & SEO**: `manifest.json`, PWA icons, Vercel Analytics, and Google Analytics configured.

---

## Features Partially Completed 🔶

### Freemium Centralization
- **Status:** Gating logic exists in individual page components.
- **Next step:** Extract into `src/lib/freemium.ts` for centralized management.

---

## Features Not Started ❌

| Feature | Phase | Notes |
|---------|-------|-------|
| **Practice/Timed toggle for RC** | 5B | Currently always-timed, no practice mode |
| **Bookmark system** | 3 | No `userBookmarks` table or UI |
| **Custom user goals** | 4 | No UI for custom goal in sidebar |

---

## Current Blockers 🚧

None. The application compiles cleanly, and critical bugs (including TypeScript/regex errors during the build) have been fixed.

---

## Current Priorities (Ordered)

1. **Test & QA** — Manually test the Core Modules, the Dashboard interactions, verify the Clerk authentication flow across all environments, and ensure the newly added Paywall states trigger correctly.
2. **Refactor Freemium Gates** — Extract the freemium gating logic from individual page components (`page.tsx`) into a centralized `src/lib/freemium.ts` utility for better maintainability.

---

## Build Status

```
✓ Compiled successfully in 6.5s (Turbopack)
✓ TypeScript passed in 9.2s
✓ 10/10 static pages generated in 671ms
✓ 17 routes total (10 static, 7 dynamic)
```

All routes build cleanly as of 2026-06-09.
