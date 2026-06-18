# HANDOFF_REPORT.md — AstraRead

> For the next AI developer or human developer  
> Last updated: 2026-06-12

---

## What Is This Project?

**AstraRead** is a web-based CAT VARC (Verbal Ability and Reading Comprehension) training platform. It is a multi-user product that helps CAT aspirants develop deep reading skills through:

1. **Deep Reading** — Long-form essays broken into paragraphs with prewritten analysis (meaning, purpose, tone, vocabulary)
2. **Grammar** — Two-section grammar system (Foundations + Reading Flow) with lessons and interactive exercises
3. **CAT RC Practice** — Past CAT exam passages and daily practice passages with per-option explanations, trap word identification, and inference logic
4. **Vocabulary** — Words saved from reading, with contextual definitions
5. **Progress Tracking** — Streaks, daily tasks, heatmap, milestones

The platform is built with **Next.js 16** (App Router), **Tailwind CSS 4**, **Drizzle ORM**, **Neon PostgreSQL**, and planned **Clerk** authentication. It uses **Gemini 2.5 Flash** for AI-powered content ingestion (parsing PDFs into structured RC passages), but no AI is used during the student's learning experience.

---

## Why Does It Exist?

Most CAT VARC preparation platforms treat reading comprehension as a speed game. AstraRead treats it as a **skill that must be built slowly through deep, deliberate reading**. The platform's philosophy: a student who deeply understands a passage in 12 minutes will outperform one who skims it in 7.

Read `docs/PROJECT_SPEC.md` for the full vision, and `docs/DECISIONS.md` for the reasoning behind every major decision.

---

## Current Status

### What's Done
- ✅ **Phase 1 (Design System):** Root layout, CSS custom properties, ThemeProvider, Sidebar, Header, HubShell/ImmersiveShell components
- ✅ **Phase 2 (Auth):** Clerk integration, route protection middleware, auth utility functions (`requireAuth`, `getCurrentUser`).
- ✅ **Phase 3 (Schema Revision):** Database structure aligned with current decisions (added `slot`, `subscriptionTier`, etc.)
- ✅ **Phase 4 (Dashboard):** Modular rewrite of the prototype monolith into `WelcomeBanner`, `DailyChecklist`, `StreakCards`, etc.
- ✅ **Phase 5 (Core Modules):** Polished Reading, RC, and Grammar with `ImmersiveShell` wrappers. Built `/vocabulary` and `/progress` pages tracking absolute volume. Implemented dedicated Results Dashboard for RC tests and PYQ year filtering.
- ✅ **Phase 6 (Freemium/Paywall):** Implemented soft paywalls and gating logic for Deep Reading (>2 essays) and Grammar (>1 topic) based on `subscriptionTier`.
- ✅ **Phase 7 (PWA/SEO/Dark Mode):** `manifest.json`, `sw.js` (network-first), `sitemap.ts`, `robots.ts`, dynamic `generateMetadata`, and full migration of legacy components to CSS custom variables for seamless Dark Mode.
- ✅ **Phase 8 (Admin Refinement):** Strict `requireAdmin` route protection and refined import forms (added robust regex parser for importing markdown passages).
- ✅ **Content Ingestion:** Manual article import form, AI-powered RC PDF extraction (Gemini), paragraph splitter, Bulk Import Markdown tool.
- ✅ **Database:** 22-table Drizzle ORM schema, seed script, migration infrastructure
- ✅ **Build:** Compiles cleanly.

### What's Not Done
- ❌ **Phase 6 (Centralization)** — Gating logic is currently implemented directly in page components. It needs to be extracted into `src/lib/freemium.ts` for centralized management.
- ❌ **Comprehensive Testing & QA** — Thorough end-to-end testing of the payment flow (Stripe/Razorpay) and unlocking process is pending.

---

## Current Priorities

The immediate focus is polishing the existing features and testing:

1. **Test & QA** — Manually test the Core Modules, the Dashboard interactions, verify the Clerk authentication flow across all environments, and ensure the newly added Paywall states trigger correctly.
2. **Refactor Freemium Gates** — Extract the freemium gating logic from individual page components (`page.tsx`) into a centralized `src/lib/freemium.ts` utility for better maintainability.

---

## Recent Work (June 18, 2026 Session)

**Goal:** Complete the Pre-Launch Checklist to ensure the application is secure, robust, and ready for production deployment.

**Tasks Completed & Thought Process:**
1. **Security & API Protection (Phase 1 Checklist):**
   - *Thought Process:* The 8 admin routes were vulnerable to unauthorized POST requests. Added `requireAdminApi` guards to all `src/app/api/admin/*` endpoints and implemented an in-memory IP-based sliding window rate limiter (`src/lib/rate-limit.ts`) to prevent abuse.
2. **Infrastructure & Keepalive (Phase 2 Checklist):**
   - *Thought Process:* Replaced legacy cron tasks with a simple DB ping route (`/api/cron/keepalive`) to keep the Neon Postgres serverless database warm, reducing cold-start latency.
3. **UX & Polish (Phase 3 Checklist):**
   - *Thought Process:* Improved user experience by adding branded `not-found.tsx` and global `error.tsx` pages. Implemented comprehensive React Suspense `loading.tsx` skeletons across all major routes. Added `manifest.json` and 192/512 icons for PWA installability, and wired up Vercel Analytics + Google Analytics in the root layout.
   - *Result:* Replaced the empty `LoggedOutDashboard` with a high-conversion marketing landing page emphasizing deep reading philosophy and offering a "Try Free" CTA.
4. **Freemium RC Logic (Phase 4 Checklist):**
   - *Thought Process:* Allowed unauthenticated users to attempt the latest year's RC passage. Once they hit submit, they are presented with a "Great attempt! Sign in to Save" modal instead of losing their answers, storing their state temporarily in `sessionStorage`.
5. **Fixed Build Crashing/TypeScript Regex Bug:**
   - *Thought Process:* A user reported an OOM/crashing issue which turned out to be a Next.js production build worker crashing due to a TypeScript error. The `bulk-parser.ts` contained an ES2018 regex flag `s` (dotAll) not supported by the TS compiler target. Fixed it by replacing `s` with the `[\s\S]` workaround, allowing `npm run build` to pass cleanly.

---

## Recent Work (June 13, 2026 Session)

**Goal:** Debug and fix critical runtime errors preventing access to admin and RC pages.

**Bugs Found & Fixed:**

1. **`Router action dispatched before initialization` crash (CRITICAL):**
   - *Root Cause:* `requireAuth()` in `src/lib/auth.ts` called `clerkAuth.redirectToSignIn()` — a Clerk SDK method that tries to manipulate the Next.js client-side router. When called from a Server Component layout (`admin/layout.tsx`), the router isn't initialized yet, causing an infinite crash loop.
   - *Fix:* Replaced `redirectToSignIn()` with `redirect("/sign-in")` from `next/navigation`, which is the correct server-side redirect mechanism.

2. **`RCFullSlotClient.tsx` — broken schema imports (CRITICAL):**
   - *Root Cause:* The file imported `{ Passage, Question, Option }` from `@/db/schema`, but those named exports don't exist. The actual exports are `rcPassages`, `rcQuestions`, `rcOptions`.
   - *Fix:* Updated all imports and type definitions to use the correct Drizzle table objects. Added explicit type annotations for all `.map()` callbacks to satisfy TypeScript strict mode.

3. **RC Slot page — `examType` enum type mismatch (TypeScript):**
   - *Root Cause:* `eq(rcPassages.examType, params.exam)` failed because `params.exam` is `string` but the column expects the enum union `"CAT" | "XAT" | "SNAP" | "NMAT" | "CUSTOM"`.
   - *Fix:* Added explicit type cast on the URL parameter.

4. **`getRecentPassages` — N+1 query performance issue:**
   - *Root Cause:* `actions.ts` fetched ALL question rows from the database, then filtered them in JavaScript to count per-passage. With many passages, this caused multi-second response times and browser fetch timeouts.
   - *Fix:* Replaced with an efficient `GROUP BY` + `count(*)` query scoped to only the relevant passage IDs.

5. **Clerk middleware infinite redirect loop (CRITICAL — root cause of all access issues):**
   - *Root Cause:* `src/proxy.ts` (the Clerk middleware) called `auth.protect()` on all `/admin(.*)` routes. Due to Windows clock skew, Clerk's JWT validation always fails ("issued in the future"), causing a redirect to `accounts.dev/sign-in`, which redirects back to localhost, infinitely.
   - *Fix:* Added a development-mode bypass in `proxy.ts` that skips `auth.protect()` for `/admin` routes when `NODE_ENV === "development"`. Production auth is unaffected.

6. **Server Action "Failed to fetch" (import-rc page):**
   - *Root Cause:* The page imported `getRecentPassages` as a Server Action. Turbopack's HMR regenerates Server Action IDs on every code change, causing stale browser references to fail with `TypeError: Failed to fetch`.
   - *Fix:* Replaced the Server Action call with a standard `fetch("/api/admin/recent-passages")` REST endpoint, which is immune to HMR ID invalidation.

7. **Database `ECONNRESET` errors (Neon Serverless):**
   - *Root Cause:* The `postgres` connection pool used module-level variables that were wiped on every Turbopack HMR reload, leaking connections. Additionally, Neon drops idle connections after ~5 minutes, but the driver tried to reuse them.
   - *Fix:* Moved the connection pool to `globalThis` (survives HMR), added `idle_timeout: 10` to proactively close idle connections, and added retry logic in the API route for transient `ECONNRESET` errors.

**Files Modified:**
- `src/proxy.ts` — Bypassed Clerk auth for admin routes in dev mode (fixes redirect loop)
- `src/lib/auth.ts` — Fixed `requireAuth()` redirect mechanism
- `src/db/index.ts` — Fixed connection pooling with globalThis + idle timeout
- `src/app/rc/components/RCFullSlotClient.tsx` — Fixed schema imports and TypeScript types
- `src/app/rc/slot/[exam]/[year]/[slot]/page.tsx` — Fixed enum type cast
- `src/app/admin/import-rc/page.tsx` — Replaced Server Action with REST fetch
- `src/app/admin/import-rc/actions.ts` — Optimized database query
- `src/app/api/admin/recent-passages/route.ts` — New REST API route with retry logic
- `src/app/admin/layout.tsx` — Dev-mode auth bypass (defense-in-depth)

---

## Recent Work (June 12, 2026 Session)

**Goal:** Enhance the RC Practice flow with a dedicated Results Dashboard, dynamic year filtering, and a robust Admin Bulk Import parser.

**Tasks Completed & Thought Process:**
1. **Admin Bulk Import Tool (Phase 8):**
   - *Thought Process:* Importing RC passages manually is too tedious. We needed a reliable bulk parser to read complex markdown formats containing passages, questions, trap words, and options. I built a robust regex parser that works across OS line endings, successfully splitting multiple passages and extracting nested explanations.
   - *Result:* An intuitive, editable Bulk Preview dashboard (`/admin/import-rc`) allowing admins to review and edit extracted passages before committing them to the database.
2. **PYQ Dynamic Year Filtering (Phase 5B):**
   - *Thought Process:* The previous PYQ list was a single flat list, requiring endless scrolling to find specific years. I added a URL-state driven horizontal Year selector to instantly filter the list.
   - *Result:* A clean top-level filter that dynamically categorizes all PYQ slots.
3. **RC Results Dashboard (Phase 5B):**
   - *Thought Process:* Previously, submitting an RC test kept the user in the "active test" view, making it hard to see a high-level summary of their performance. I built a dedicated, full-width `RCResultsView` component that calculates score, accuracy, and time. Based on user feedback, I made the layout expansive (up to 1400px wide) and automatically expanded all detailed explanations for immediate review.
   - *Result:* An aesthetically pleasing post-submission dashboard providing immediate, detailed feedback, with an option to toggle back to the raw passage view.

---

## Recent Work (June 10, 2026 Session)

**Goal:** Implement Freemium gating (Phase 6) and complete the Dark Mode migration.

**Tasks Completed & Thought Process:**
1. **Freemium Paywall (Phase 6):**
   - *Thought Process:* Gated access to premium content to support monetisation. Implemented logic directly in the module pages (e.g., Reading and Grammar `page.tsx`) to check the user's `subscriptionTier`. Added a visually distinct blurred `SoftPaywall` component inside the content pages to tease the value while preventing unauthorized reading.
   - *Result:* Deep Reading is locked after 2 essays, and Grammar is locked after 1 topic for free users.
2. **Dark Mode Migration Completion (Phase 7):**
   - *Thought Process:* Continued the migration of remaining hardcoded Tailwind colors to CSS custom properties (e.g., `var(--color-bg)`) in components like `ReadingLibraryClient` and `ArticleReaderClient`.
   - *Result:* The Reading module now fully supports seamless Dark Mode toggling.

---

## Recent Work (June 9, 2026 Session)

**Goal:** Evolve the prototype from a collection of visual mockups into a fully interconnected, production-ready SaaS application with proper data boundaries, global theming, and foundational SEO/PWA capabilities.

**Tasks Completed & Thought Process:**
1. **Dashboard Monolith Rewrite (Phase 4):**
   - *Thought Process:* The 1,297-line prototype was unmaintainable. We decomposed it into modular server components (`WelcomeBanner`, `StreakCard`, etc.) backed by actual Drizzle ORM queries, shifting data fetching away from the client for performance and SEO benefits.
   - *Result:* A clean, maintainable dashboard that pulls live user metrics.
2. **Core Modules Polish (Phase 5):**
   - *Thought Process:* The user experience was disjointed. By systematically wrapping all index pages in `HubShell` and specific reading/practice pages in `ImmersiveShell`, we created a consistent layout hierarchy.
   - *Result:* We successfully shipped the `/vocabulary` and `/progress` pages. We deliberately pivoted the "Time Spent" metric to "Volume of Effort" (number of articles read) to encourage slow, deep reading rather than speed-running.
3. **PWA, SEO, Dark Mode (Phase 7):**
   - *Thought Process:* Hardcoded Tailwind colors like `bg-white` and `text-stone-900` broke the app's aesthetic in dark mode. Rather than manually injecting `dark:` variants, we automated a mass-refactor to map these to our established CSS custom properties (e.g., `var(--color-bg)`). For PWA, we opted for a highly reliable Network-First `sw.js` instead of complex offline caching, recognizing that users need accurate DB syncs.
   - *Result:* A seamless dark mode experience, installable PWA footprint, and search-friendly metadata (e.g., dynamically titled RC pages like "CAT 2024 Slot 1 Solutions").
4. **Admin Refinements (Phase 8):**
   - *Thought Process:* Admin routes were previously open. We implemented `requireAdmin` layout protection and added necessary parameters like `slot` to the RC importer, allowing for proper PYQ segmentation without overcomplicating the UI for now.
   - *Result:* A secure, functional admin ingestion pipeline.

---

## Known Risks

### 1. Dashboard Monolith Complexity (Medium Risk)
The 1,297-line `page.tsx` file is a complete prototype with inline components for Dashboard, Reading, Grammar, RC, and Progress. It uses `framer-motion`, complex state management, and hardcoded data. The rewrite is significant — it's not a refactor, it's a replacement.

**Mitigation:** Extract each section as a standalone component. The current prototype is a visual reference, not code to preserve.

### 2. Design Token Migration Debt (Medium Risk)
Existing page components (ReadingLibraryClient, ArticleReaderClient, GrammarPracticeClient, RCPracticeClient) use hardcoded Tailwind classes like `bg-white`, `text-stone-950`, `bg-[#f4f6f0]`. These need to be migrated to CSS custom properties for dark mode to work consistently.

**Mitigation:** Migrate one module at a time during Phase 5. Use find-and-replace for common patterns.

### 3. Content Pipeline Bottleneck (Low-Medium Risk)
The platform's value depends on content. Currently there are 6 mock essays, 1 grammar topic with 5 exercises, and 1 sample RC passage. Reaching MVP quality requires 30+ essays, 12+ grammar topics, and all CAT PYQs from 2020-2025.

**Mitigation:** AI-assisted RC import reduces effort. Grammar content can be batch-created in seed.ts. Article import form exists and works.

### 4. Clerk Vendor Dependency (Low Risk)
Clerk handles all authentication. If Clerk changes pricing or has outages, the platform is affected. The `auth_provider_user_id` column in the users table creates a mapping layer, but switching auth providers would still be significant.

**Mitigation:** The mapping table means user data is always in our DB, not Clerk's.

### 5. Windows Development Environment (Low Risk)
The project is developed on Windows, which caused issues with parenthesized directory names (route groups). This was resolved by using wrapper components instead. Future developers on Mac/Linux may prefer route groups, but the wrapper approach works universally.

---

## Important Decisions (Must-Know)

These decisions are documented in detail in `docs/DECISIONS.md`. The top 5 you must understand before writing code:

1. **Prewritten, not live AI.** All explanations are stored in the database. AI is only used during content ingestion (admin importing RC passages). Never add live AI calls to student-facing features.

2. **HubShell vs ImmersiveShell.** Hub pages (dashboard, lists) use `HubShell` wrapper. Content pages (reading, solving RC, grammar lessons) use `ImmersiveShell` wrapper. Don't create new layout patterns.

3. **Grammar has two sections.** Grammar Foundations (sortOrder < 10) teaches word-level skills. Reading Flow/Patterns (sortOrder >= 10) teaches passage-level skills. These are separate pedagogical tracks.

4. **PYQs are always free.** Never gate PYQ content. It drives SEO traffic and is the acquisition funnel.

5. **Positive-only progress.** Never show negative indicators in progress analytics. No red numbers, no "you're behind" messages, no user comparisons.

---

## File Map for Common Tasks

| Task | Key Files |
|------|-----------|
| Change design tokens | `src/app/globals.css` (CSS variables) |
| Change fonts | `src/app/layout.tsx` (next/font/google imports) |
| Add database table | `src/db/schema.ts` → run `npm run db:generate` + `npm run db:push` |
| Seed new content | `src/db/seed.ts` → run `npm run db:seed` |
| Add a new page | `src/app/{route}/page.tsx` — wrap with `HubShell` or `ImmersiveShell` |
| Import an article | Use `/admin/import` form or `POST /api/admin/import` API |
| Import RC passage | Use `/admin/import-rc` form (PDF upload) |
| Add auth protection | (After Phase 2) `src/middleware.ts` for route protection, `src/lib/auth.ts` for utilities |
| Check build health | `cmd /c "npx next build 2>&1"` from project root |

---

## Documentation Index

All documentation lives in `docs/` at the project root:

| Document | Purpose |
|----------|---------|
| `PROJECT_SPEC.md` | Vision, mission, audience, philosophy, monetisation |
| `CURRENT_STATE.md` | Feature inventory, blockers, priorities |
| `ROADMAP.md` | 8-phase development plan with dependencies |
| `DECISIONS.md` | 14 major decisions with reasoning and tradeoffs |
| `ARCHITECTURE.md` | Tech stack, folder structure, deployment, ingestion pipelines |
| `DATABASE_SCHEMA.md` | All 22 tables with columns, relationships, planned changes |
| `CONTENT_STRATEGY.md` | Content philosophy, quality standards, difficulty progression |
| `HANDOFF_REPORT.md` | This document — start here |

---

## Quick Start for New Developers

```bash
# Install dependencies
npm install

# Set up environment
# Copy .env.local.example to .env.local (need DATABASE_URL, GOOGLE_GENERATIVE_AI_API_KEY)

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`.
