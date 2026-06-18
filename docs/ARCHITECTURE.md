# ARCHITECTURE.md — AstraRead

> Last updated: 2026-06-09

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 16.2.6 | Full-stack React framework with server components, API routes, Turbopack |
| **Language** | TypeScript | ^5 | Type safety across frontend and backend |
| **UI Library** | React | 19.2.4 | Component rendering |
| **Styling** | Tailwind CSS | ^4 | Utility-first CSS with PostCSS integration |
| **Animations** | Framer Motion | ^12.40.0 | Page transitions, reveal animations, interactive feedback |
| **Icons** | Lucide React | ^1.16.0 | Consistent, tree-shakeable icon set |
| **ORM** | Drizzle ORM | ^0.45.2 | Type-safe SQL queries, zero runtime overhead |
| **Database** | PostgreSQL (Neon) | Serverless | Cloud-native serverless Postgres |
| **AI SDK** | Vercel AI SDK + Google AI | ai@^6, @ai-sdk/google@^3 | Structured object generation for content ingestion |
| **PDF Parsing** | pdf2json | ^4.0.3 | Extract raw text from uploaded PDF files |
| **Validation** | Zod | ^4.4.3 | Schema validation for AI output and API inputs |
| **Auth (Planned)** | Clerk | Not installed | Google sign-in, roles, session management |

### Fonts
- **Headings:** Instrument Serif (serif) — loaded via `next/font/google`
- **Body:** Inter (sans-serif) — loaded via `next/font/google`
- Exposed as CSS custom properties `--font-serif` and `--font-sans`

---

## Hosting Stack (Current)

| Service | Usage |
|---------|-------|
| **Development** | Local dev server (`npm run dev` via Turbopack) |
| **Database** | Neon PostgreSQL (free tier, serverless) |
| **Deployment (Planned)** | Vercel (zero-config with Next.js) |
| **CDN** | Vercel Edge Network (automatic with deployment) |
| **DNS (Planned)** | Custom domain TBD |

---

## Database Approach

### Connection
- **Driver:** `postgres` (postgres.js) with connection pooling (`max: 10, prepare: false`)
- **ORM:** Drizzle ORM with full schema inference
- **Singleton pattern:** `getDb()` in `src/db/index.ts` lazily initializes the connection

### Schema Management
- **Config:** `drizzle.config.ts` at project root
- **Migrations:** `drizzle/` directory for generated SQL migrations
- **Commands:**
  - `npm run db:generate` — generate migration from schema diff
  - `npm run db:push` — push schema directly (dev)
  - `npm run db:migrate` — run migrations (production)
  - `npm run db:studio` — visual database browser
  - `npm run db:seed` — seed initial data

### Environment
- `DATABASE_URL` in `.env.local` — Neon connection string with SSL

---

## Authentication Approach (Planned — Phase 2)

### Architecture
```
Browser → Clerk JS → Clerk API → Next.js middleware → App
                                         ↓
                                   Route protection
                                         ↓
                                   DB user upsert
```

### Key Design Decisions
1. **Clerk middleware** at `src/middleware.ts` handles route protection
2. **User mapping:** Clerk's `userId` maps to `users.auth_provider_user_id` in PostgreSQL
3. **Upsert on sign-in:** First sign-in creates DB user record, subsequent sign-ins update `last_login_at`
4. **Role-based access:** Clerk roles for admin protection (no custom RBAC)
5. **Subscription tier:** Stored in DB (`users.subscription_tier`), not in Clerk metadata

---

## Deployment Approach (Planned)

### Vercel Configuration
- **Framework preset:** Next.js (auto-detected)
- **Build command:** `next build` (Turbopack)
- **Node.js version:** 20.x
- **Environment variables:** `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`

### Deployment Flow
```
Local dev → Git push → Vercel build → Preview deployment → Production promotion
```

---

## Folder Structure

```
d:\Games\ai-website-product-prompt-deep-reading\
├── docs/                              # ← Project documentation (YOU ARE HERE)
│   ├── PROJECT_SPEC.md
│   ├── CURRENT_STATE.md
│   ├── ROADMAP.md
│   ├── DECISIONS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── CONTENT_STRATEGY.md
│   └── HANDOFF_REPORT.md
│
├── drizzle/                           # Generated SQL migrations
├── public/                            # Static assets
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (fonts, ThemeProvider, SEO)
│   │   ├── globals.css                # Design system (CSS custom properties)
│   │   ├── page.tsx                   # Dashboard (monolith — to be rewritten)
│   │   │
│   │   ├── reading/
│   │   │   ├── page.tsx               # Article library (server component)
│   │   │   ├── [slug]/page.tsx        # Article reader (server component)
│   │   │   ├── components/            # ReadingLibraryClient, ArticleReaderClient,
│   │   │   │                          # ArticleCard, ArticleSummary, InlineQuestionCard
│   │   │   └── data/articles.ts       # Mock article data (fallback)
│   │   │
│   │   ├── grammar/
│   │   │   ├── page.tsx               # Grammar topics index (server component)
│   │   │   ├── topic/[slug]/
│   │   │   │   ├── page.tsx           # Topic lesson + exercises
│   │   │   │   └── practice/page.tsx  # Practice drill page
│   │   │   └── components/            # GrammarPracticeClient
│   │   │
│   │   ├── rc/
│   │   │   ├── page.tsx               # RC passages index (server component)
│   │   │   ├── [id]/page.tsx          # RC practice page (split-screen)
│   │   │   └── components/            # RCPracticeClient
│   │   │
│   │   ├── admin/
│   │   │   ├── import/page.tsx        # Manual article import form
│   │   │   └── import-rc/page.tsx     # RC passage import (PDF + AI)
│   │   │
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── import/route.ts    # POST: manual article import
│   │       │   ├── import-rc/route.ts # POST: save RC passage to DB
│   │       │   └── extract-rc/route.ts# POST: AI PDF extraction (Gemini)
│   │       ├── articles/
│   │       │   ├── route.ts           # GET: list articles
│   │       │   └── [slug]/route.ts    # GET: single article
│   │       └── grammar/
│   │           └── attempt/route.ts   # POST: save grammar attempt
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── ThemeProvider.tsx       # Client-side dark mode context
│   │       ├── Sidebar.tsx            # Dark sidebar with nav + countdown
│   │       ├── Header.tsx             # Sticky header with theme toggle
│   │       ├── HubShell.tsx           # Sidebar + Header wrapper
│   │       └── ImmersiveShell.tsx     # Full-width minimal wrapper
│   │
│   ├── db/
│   │   ├── index.ts                   # Singleton DB connection
│   │   ├── schema.ts                  # Full Drizzle schema (22 tables)
│   │   └── seed.ts                    # Seed data script
│   │
│   └── lib/
│       └── ingestion/
│           ├── types.ts               # ParsedArticle, InlineQuestion types
│           ├── store.ts               # Article upsert logic
│           ├── logger.ts              # Console logger
│           ├── parsers/
│           │   └── paragraph-splitter.ts  # Text → paragraphs with connectors
│           └── processors/            # (empty — for future batch processing)
│
├── drizzle.config.ts                  # Drizzle Kit configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── .env.local                         # Environment variables (not committed)
```

---

## Content Ingestion Strategy

### Deep Reading Articles (Manual)

```
Admin pastes article text → /admin/import form
         ↓
Paragraph splitter extracts paragraphs + connector words
         ↓
POST /api/admin/import → storeArticle()
         ↓
DB: articles + article_paragraphs rows created
         ↓
(Later, manually) Add paragraph explanations, vocabulary, tone analysis
via direct DB edits or future admin enhancement
```

**Current state:** Articles can be imported with full text, metadata, and inline questions. Paragraph-level explanations must be added separately (either through direct DB operations or a future admin UI enhancement).

### RC Passages (AI-Assisted)

```
Admin uploads CAT PDF + optional answer key → /admin/import-rc form
         ↓
POST /api/admin/extract-rc → PDF parsed by pdf2json
         ↓
Gemini 2.5 Flash extracts passage + questions + options + explanations
         ↓
Admin reviews extracted JSON in UI preview
         ↓
Admin clicks "Save" → POST /api/admin/import-rc
         ↓
DB: rc_passages + rc_questions + rc_options rows created
```

**Key detail:** The AI generates rich pedagogical content — per-option explanations, tone clues, trap words, inference logic — all from a single structured generation call. This content is stored permanently and never regenerated.

### Grammar Content (Seed + Manual)

```
Grammar topics, lessons, and exercises are defined in src/db/seed.ts
         ↓
npm run db:seed → Inserts/updates grammar content
         ↓
Additional content added by directly editing seed.ts and re-running
```

**Current state:** Only one topic (Articles) is seeded with 1 lesson and 5 exercises. Future topics should follow the same pattern in the seed file, or a future admin UI for grammar content creation.

### Content Volume Targets

| Content Type | Current | Target (MVP) | Frequency |
|-------------|---------|--------------|-----------|
| Deep Reading essays | 6 mock + DB imports | 30+ | 2 per day |
| PYQ RC passages | 1 sample | All CAT 2020–2025 | Bulk import |
| RC Practice passages | 0 | 20+ | 1 per day |
| Grammar topics | 1 (Articles) | 12+ (6 Foundations + 6 Reading Patterns) | One-time |
| Grammar exercises | 5 | 100+ | With topics |
