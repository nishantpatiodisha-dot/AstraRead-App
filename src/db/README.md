# Database

This project uses PostgreSQL with Drizzle ORM.

## Setup

1. Start local PostgreSQL if needed:

```bash
docker compose up -d postgres
```

2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to your PostgreSQL connection string.
4. Generate migrations:

```bash
npm.cmd run db:generate
```

5. Apply migrations:

```bash
npm.cmd run db:migrate
```

6. Seed static MVP content:

```bash
npm.cmd run db:seed
```

## Design Notes

- Article explanations and article analyses are stored permanently after creation.
- Grammar and RC content is static and database-driven.
- User summaries, attempts, tasks, vocabulary, streaks, and progress snapshots are stored separately from shared content.
- `getDb()` lazily initializes the PostgreSQL client so `next build` does not require database environment variables.
