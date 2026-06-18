# ROADMAP.md — AstraRead

> Last updated: 2026-06-12

---

## Phase Overview

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 1 | Foundation | ✅ Complete | Design system, layout shell, theme provider |
| 2 | Auth | ✅ Complete | Clerk integration, user sessions, middleware |
| 3 | Schema Revision | ✅ Complete | Database alignment with locked decisions |
| 4 | Dashboard | ✅ Complete | Hub page rewrite with real data |
| 5 | Core Modules | ✅ Complete | Polish reading, RC, grammar + new vocab/progress pages |
| 6 | Freemium & Paywall | ✅ Complete | Access gates and soft paywall |
| 7 | Dark Mode, PWA, SEO | ✅ Complete | Full dark mode, manifest, sitemap, SEO |
| 8 | Admin Refinement | ✅ Complete | Role protection, bulk import parser, keepalive cron |

---

## Phase 1: Foundation — Design System + Layout Shell ✅

**Objective:** Establish visual identity, shared layout components, and the CSS variable design system before any module work begins.

**Features Completed:**
- Root layout with Instrument Serif + Inter fonts, SEO metadata
- Complete CSS custom property design system (light and dark tokens)
- ThemeProvider (client-side, `data-theme` attribute, localStorage, system preference)
- Sidebar component (dark, with nav links, admin section, CAT 2026 countdown)
- Header component (sticky, glassmorphism, dark mode toggle)
- HubShell wrapper component (sidebar + header + content area)
- ImmersiveShell wrapper component (minimal header + back button + full-width content)
- Fixed pre-existing TypeScript errors in `RCPracticeClient.tsx`

**Dependencies:** None

**Completion Date:** 2026-06-09

---

## Phase 2: Auth — Clerk Integration ✅

**Objective:** Add multi-user authentication so every feature can store and retrieve user-specific data.

**Features:**
- Install `@clerk/nextjs` package
- Create `src/middleware.ts` with route protection rules:
  - Public: `/`, `/reading` (limited), `/rc` (latest year PYQs)
  - Protected: `/vocabulary`, `/progress`, `/grammar`, `/admin/*`
  - Admin-only: `/admin/*`
- Wrap app with `<ClerkProvider>` in root layout
- Create `src/lib/auth.ts` utility functions:
  - `getCurrentUser()` — get Clerk user + DB record
  - `requireAuth()` — redirect if unauthenticated
  - `requireAdmin()` — check admin role
  - `upsertUser()` — create/update user in DB on sign-in
- Add user fields to schema: `subscription_tier`, `custom_goal_label`, `custom_goal_date`, `last_login_at`

**Dependencies:** Clerk account setup, `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` env vars

**Why This Phase Is Next:** Every user-facing feature (streaks, progress, vocabulary, reading history, freemium gates) depends on knowing who the user is. Without auth, no per-user data can be stored.

---

## Phase 3: Database Schema Revision ✅

**Objective:** Align the database schema with all 23 locked-in product decisions.

**Features:**
- Modify `users` table: add `subscription_tier`, `custom_goal_label`, `custom_goal_date`, `last_login_at`
- Modify `grammarTopics`: add `section` column (`"foundations"` | `"reading_patterns"`)
- Modify `rcPassages`: add `slot` column for PYQ slot grouping
- Add `userArticleReads` table (replaces `readingSessions`)
- Add `userBookmarks` table
- Remove `paragraphSummaries` table (user-written summaries removed from product)
- Remove `readingSessions` table (replaced by simpler tracking)
- Remove `studySessions` table (not needed — per-module tracking instead)
- Generate and apply Drizzle migration
- Update seed script

**Dependencies:** Phase 2 (user schema changes)

---

## Phase 4: Dashboard ✅

**Objective:** Rewrite the 1,297-line dashboard monolith into a focused, data-driven hub page.

**Features:**
- **Logged-in view:** Welcome banner, daily progress ring, stat cards (DB-driven), today's tasks (5 system + custom), GitHub-style heatmap, streak cards
- **Logged-out view:** Generic welcome, feature overview cards, "Sign up free" CTA
- Extract components: `WelcomeBanner`, `StatCards`, `DailyTasks`, `Heatmap`, `StreakCards`, `ProgressRing`
- Server component with DB queries — no client-side data fetching
- Apply new design system tokens throughout

**Dependencies:** Phase 2 (auth for logged-in/out distinction), Phase 3 (schema for stats queries)

---

## Phase 5: Core Module Polish ✅

**Objective:** Migrate all modules to the new design system, add HubShell/ImmersiveShell wrappers, and build the two missing pages.

### 5A: Deep Reading
- Wrap reading list with HubShell, article reader with ImmersiveShell
- Add expandable analysis sections below essay (paragraph meanings, difficult words, tone, central ideas)
- Add "Save to vocab" button in difficult words section
- Add floating translucent timer pill (play/pause + stop)
- Add "Mark as read" button
- Add freemium gate (2 essays for free users)

### 5B: RC Practice
- [x] Wrap RC list with HubShell, passage view with ImmersiveShell
- [x] Implement dynamic Year filtering on the PYQ index page
- [x] Add practice/timed toggle at top of passage view
- [x] Implement deferred feedback (dedicated Results Dashboard upon submission)
- [ ] Fix N+1 query in passage page
- [ ] SEO meta tags per passage

### 5C: Grammar
- Wrap grammar list with HubShell, topic page with ImmersiveShell
- Rename "Reading Flow" to "Reading Patterns"
- Add freemium gate (1 topic for free users)
- Track mastery percentage per topic

### 5D: Vocabulary (New Page)
- Create `/vocabulary` page with list view
- Term, meaning, source article (linked), date saved
- Search and sort, delete per word
- Empty state with helpful message

### 5E: Progress (New Page)
- Create `/progress` page with positive-only stats
- Stat cards, GitHub heatmap, Duolingo-style milestones
- Progress toward locked milestones

**Dependencies:** Phase 2 (auth), Phase 3 (schema), Phase 4 (dashboard demonstrates pattern)

---

## Phase 6: Freemium & Paywall ✅

**Objective:** Implement content gating and soft paywall to enable monetisation.

**Features:**
- Create `src/lib/freemium.ts` with access-checking functions
- Create `SoftPaywall` component (blurred background, upgrade CTA)
- Gate Deep Reading (2 free), RC Practice (2 free), Grammar (1 free topic)
- PYQs remain free (SEO strategy)
- Logged-out access limited to dashboard overview + 1 essay + latest year PYQs

**Dependencies:** Phase 2 (auth — need subscription_tier), Phase 5 (modules ready to gate)

---

## Phase 7: Dark Mode, PWA, SEO ✅

**Objective:** Full dark mode coverage, installable PWA, and search engine optimisation.

**Features:**
- **Dark mode:** Migrate all existing page components from hardcoded classes to CSS variables (CSS tokens already defined in Phase 1)
- **PWA:** `manifest.json`, basic service worker, "Add to Home Screen" support
- **SEO:** Per-page metadata exports, dynamic sitemap (`/sitemap.ts`), `robots.txt`, structured data (JSON-LD) on PYQ pages

**Dependencies:** Phase 5 (all pages finalized before SEO meta tags)

**Partial completion:** CSS custom property tokens for dark mode already defined in `globals.css`. ThemeProvider already functional. Remaining work is component-level migration.

---

## Phase 8: Admin Refinement ✅

**Objective:** Protect admin routes and improve content management forms.

**Features:**
- Add Clerk role protection to `/admin/*` routes
- Refine essay import form: add fields for paragraph meanings, vocabulary, tone, central ideas
- [x] Refine RC import form: Built robust custom regex parser for importing markdown passages, questions, and explanations with editable preview
- Remove unused cron job configuration from `vercel.json`

**Dependencies:** Phase 2 (Clerk roles)

---

## Milestones

| Milestone | Target | Description |
|-----------|--------|-------------|
| **Alpha** | After Phase 4 | Dashboard + auth + DB working end-to-end. First real user can sign in and see their data. |
| **Beta** | After Phase 5 | All modules polished and connected. Complete reading→grammar→RC→progress flow works. |
| **MVP** | After Phase 6 | Freemium gates active. Ready for limited external testing with real CAT aspirants. |
| **Launch** | After Phase 7+8 | Full dark mode, PWA, SEO, admin tools. Ready for public launch. |
