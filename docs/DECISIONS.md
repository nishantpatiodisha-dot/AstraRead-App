# DECISIONS.md — AstraRead

> Last updated: 2026-06-09  
> This document preserves institutional memory. Every major decision is recorded with reasoning, benefits, and tradeoffs.

---

## D1: RC Is the Core Product, Not Grammar

**Decision:** Reading Comprehension is the primary product. Grammar and other modules serve as supporting infrastructure.

**Reasoning:** CAT VARC is dominated by RC — roughly 70% of the section. Most students struggle not because they can't conjugate verbs, but because they can't follow a complex argument across 4–6 paragraphs. The market gap is in *comprehension quality*, not grammar rule memorisation.

**Benefits:**
- Clear product focus — every feature serves deep reading
- Content moat — annotated essays and explained passages are hard to replicate
- SEO advantage — "CAT RC solutions" has high search volume

**Tradeoffs:**
- Grammar module gets less development priority
- Students who need basic grammar help may initially feel underserved

---

## D2: Grammar Foundations and CAT Verbal Ability Are Separate

**Decision:** The grammar section is split into two subsections: **Grammar Foundations** (articles, modifiers, subject-verb agreement, etc.) and **Reading Flow / Reading Patterns** (connectors, tone shifts, argument structure, etc.).

**Reasoning:** These serve different cognitive functions. Grammar Foundations teaches how words function in a sentence — this is prerequisite knowledge. Reading Flow teaches how authors steer logic across paragraphs — this is the bridge between grammar and reading comprehension. Conflating them would confuse the learning path.

**Benefits:**
- Clear progression: learn the tools, then learn how authors use them
- Reading Flow is unique to AstraRead — no other platform teaches "decoding the invisible architecture of arguments"
- Distinct difficulty curves allow flexible gating

**Tradeoffs:**
- Two sections in the UI where one might seem simpler
- Requires separate content creation workflows

**Implementation:** `grammarTopics.sortOrder < 10` = Foundations, `>= 10` = Reading Flow (to be changed to a `section` column in Phase 3)

---

## D3: Prewritten Explanations, Not Live AI

**Decision:** All explanations (paragraph meanings, RC option analyses, grammar lessons, tone breakdowns, trap word identification) are **prewritten and stored in the database**. AI is used only during content ingestion, not during the student experience.

**Reasoning:**
1. **Cost:** Live AI calls per user interaction would cost $0.01–0.10 per request. At scale, this destroys margins for a freemium product.
2. **Quality:** Prewritten explanations can be reviewed, edited, and perfected by humans. Live AI output varies in quality and can hallucinate.
3. **Speed:** Static content loads instantly. AI generation adds 2–10 seconds of latency per interaction.
4. **Reliability:** No dependency on AI provider uptime during the learning experience.

**Benefits:**
- Near-zero per-user cost
- Consistent, high-quality explanations
- Instant load times
- Works offline (future PWA)

**Tradeoffs:**
- Content creation is labor-intensive upfront
- No personalised AI tutoring (but this is a deliberate product choice, not a limitation)

**Implementation:** `explanationSource` enum has values `"manual"` and `"generated_once"` — both are static after creation.

---

## D4: Soft Paywall, Not Hard Block

**Decision:** Premium content is gated with a **soft paywall** — blurred content with a centered "Upgrade to continue" overlay. No hard redirects or error pages.

**Reasoning:** A soft paywall shows students exactly what they're missing. The blurred preview creates desire without frustration. Hard blocks feel punitive and increase bounce rate.

**Benefits:**
- Higher conversion: students see the value before paying
- Lower friction: no confusing redirects
- Maintains SEO: pages still server-render for search engines (behind the blur)

**Tradeoffs:**
- Content is technically in the DOM (though blurred) — a sophisticated user could inspect-element to read it
- Mitigated by: the real value is the analysis/explanations, not the raw text

---

## D5: PYQs Are Always Free

**Decision:** CAT Previous Year Questions (PYQs) are free for all users, including logged-out visitors.

**Reasoning:** PYQs are the #1 SEO driver for any CAT prep platform. A student searching "CAT 2024 Slot 1 RC passage 3 solutions" should land on AstraRead without hitting a paywall. Free PYQs build trust, drive organic traffic, and serve as the top of the acquisition funnel.

**Benefits:**
- Massive organic traffic potential
- Trust-building with new visitors
- Competitive necessity (most platforms offer some PYQs free)

**Tradeoffs:**
- Revenue from PYQ content is zero — monetisation relies on other modules
- Need high-quality PYQ explanations to differentiate from free alternatives

---

## D6: Hybrid Architecture — Hub + Immersive

**Decision:** Use two distinct layout patterns: **Hub pages** (sidebar + header, for lists and dashboards) and **Immersive pages** (full-width, no sidebar, for reading/solving).

**Reasoning:** A student browsing the article library needs navigation and context. A student reading an essay needs maximum focus — no sidebar, no distractions, just text and analysis. Forcing both experiences into one layout compromises both.

**Benefits:**
- Optimal UX for each context
- Reading experience feels premium and distraction-free
- Hub pages feel organised and navigable

**Tradeoffs:**
- Two layout systems to maintain
- Students transition between layouts on navigation

**Implementation:** `HubShell.tsx` wraps hub pages (dashboard, lists), `ImmersiveShell.tsx` wraps content pages (reading, RC, grammar lessons). Originally planned as Next.js route groups `(hub)` and `(immersive)`, changed to wrapper components due to Windows path compatibility with parentheses in directory names.

---

## D7: Clerk for Auth, Not NextAuth/Auth.js

**Decision:** Use Clerk for authentication, not NextAuth or custom auth.

**Reasoning:** Clerk provides Google sign-in with near-zero setup, built-in user management dashboard, role-based access control, and React components. For a CAT prep product targeting Indian students (who overwhelmingly use Google accounts), one-click Google sign-in is critical.

**Benefits:**
- Google sign-in in < 30 minutes of setup
- Built-in roles for admin protection
- Managed user dashboard (no admin panel needed for user management)
- Reliable session management with minimal code

**Tradeoffs:**
- Vendor lock-in to Clerk's pricing
- User IDs are Clerk-specific — need mapping table (`auth_provider_user_id`)
- Monthly cost at scale (free tier: 10,000 MAU)

---

## D8: Neon PostgreSQL, Not Supabase or PlanetScale

**Decision:** Use Neon PostgreSQL for the database, accessed through Drizzle ORM.

**Reasoning:** Neon offers serverless PostgreSQL that scales to zero, which keeps costs at $0 during development and early launch. Drizzle ORM provides type-safe queries without runtime overhead. PostgreSQL's JSONB support is essential for storing structured metadata (vocabulary arrays, connector words, exercise choices).

**Benefits:**
- $0 cost during development (generous free tier)
- Full PostgreSQL feature set (JSONB, UUIDs, enums)
- Serverless scaling matches Next.js serverless functions
- Drizzle ORM: type-safe, no runtime overhead, excellent DX

**Tradeoffs:**
- Cold starts on free tier (mitigated by Neon's connection pooling)
- Less ecosystem tooling than Supabase (no built-in auth, storage, etc.)

---

## D9: Gemini for AI Ingestion, Not GPT-4/Claude

**Decision:** Use Google's Gemini 2.5 Flash model for AI-powered content ingestion (PDF extraction, passage structuring).

**Reasoning:** The user has significantly more usage allowance on Gemini models compared to OpenAI or Anthropic. Since AI is only used during content ingestion (not student-facing), the lower cost of Gemini Flash is a major advantage.

**Benefits:**
- Higher usage limits for the user's account
- Lower per-token cost than GPT-4 or Claude
- Google AI SDK (`@ai-sdk/google`) integrates cleanly with Vercel AI SDK

**Tradeoffs:**
- Slightly lower reasoning quality than GPT-4 for complex extraction tasks
- Mitigated by: using structured output (Zod schema) to constrain the model

**Implementation:** `@ai-sdk/google` package, `gemini-2.5-flash` model, `generateObject()` with Zod schema for structured RC extraction.

---

## D10: Daily Tasks — System Tasks + Custom Tasks

**Decision:** The daily task system has two layers: 5 system-defined tasks (seeded from `dailyChecklistTemplates`) and unlimited user-created custom tasks.

**Reasoning:** System tasks ensure every student covers the basics daily (read a paragraph, write summaries, do a grammar drill, attempt an inference question, review vocabulary). Custom tasks give students ownership over their preparation plan. This combines structure with agency.

**Benefits:**
- Consistent baseline for all users
- Personalisation without complexity
- Clear progress metric (tasks completed / total)

**Tradeoffs:**
- System tasks are static — may feel repetitive after months
- Mitigated by: tasks are intentionally generic ("Attempt one inference question") so they're always relevant

---

## D11: Positive-Only Progress Analytics

**Decision:** The progress system only shows positive metrics and achievements. No red indicators, no "you're behind" messages, no comparison with other users.

**Reasoning:** CAT preparation is already stressful. A platform that shames students for missed days or low scores adds anxiety without adding learning. Showing positive trends, milestones achieved, and personal bests creates a supportive environment that encourages consistency.

**Benefits:**
- Reduces anxiety around daily practice
- Duolingo-style milestones create dopamine loops
- Focus on growth, not gaps

**Tradeoffs:**
- Students may not recognise weak areas without negative feedback
- Mitigated by: adaptive difficulty in grammar exercises implicitly addresses weaknesses

---

## D12: Deferred Feedback for RC, Immediate for Grammar

**Decision:** RC practice uses deferred feedback (no correct/wrong shown during the attempt). Grammar exercises use immediate feedback (right/wrong after each answer).

**Reasoning:** RC tests holistic comprehension — showing feedback after each question would disrupt the passage analysis flow. Grammar exercises are discrete skills — immediate feedback reinforces the rule being practiced.

**Benefits:**
- RC experience mirrors actual exam conditions
- Grammar feedback accelerates rule learning
- Clear distinction between "exam practice" and "skill building"

**Tradeoffs:**
- Some students may find RC frustrating without immediate feedback
- Mitigated by: comprehensive post-submission review with per-option explanations

---

## D13: Content Sources — Aeon, Guardian, Hindu

**Decision:** Deep reading content is sourced from Aeon, The Guardian Long Reads, and The Hindu editorials.

**Reasoning:** These three sources represent the reading difficulty spectrum CAT students encounter:
- **Aeon:** Dense philosophical and scientific essays (Advanced/CAT+ difficulty)
- **The Guardian:** Well-structured long-form journalism (Moderate/Advanced)
- **The Hindu:** Indian context editorials, closer to CAT passage style (Moderate/CAT+)

**Benefits:**
- Covers the full difficulty range
- Indian context (The Hindu) resonates with the target audience
- High-quality writing that genuinely improves reading skills

**Tradeoffs:**
- Copyright considerations for commercial use
- Mitigated by: linking to original articles, not redistributing content at scale

---

## D14: Wrapper Components Over Route Groups

**Decision:** Use importable wrapper components (`HubShell`, `ImmersiveShell`) instead of Next.js route groups (`(hub)`, `(immersive)`) for layout management.

**Reasoning:** Windows PowerShell, cmd, xcopy, and robocopy all fail to create or copy into directories with parentheses in the name. After extensive testing, route groups proved incompatible with the Windows development environment.

**Benefits:**
- Full Windows compatibility
- Same visual result (sidebar + header vs full-width)
- More explicit — pages declare their layout, not their directory location
- Easier to refactor individual pages

**Tradeoffs:**
- Each page must manually import and wrap with the shell component
- No automatic layout nesting from the file system
- Slightly more boilerplate per page

**Implementation:** `HubShell` renders `<Sidebar />` + `<Header />` + `<main>{children}</main>`. `ImmersiveShell` renders a minimal header + full-width `<main>`.
