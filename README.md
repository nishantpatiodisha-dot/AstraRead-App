# Deep Reading Practice Platform

A full-stack Next.js application designed to provide an immersive, highly functional environment for practicing Reading Comprehension (RC) passages, specifically tailored for CAT aspirants.

## Features

- **Split-Screen Practice Interface**: A modern, adjustable interface where users can read passages on the left and answer questions on the right. Includes customizable font sizes and a mock-test timer.
- **Dedicated Results Dashboard**: Upon submitting a practice attempt, users are presented with a beautiful summary dashboard showing Score, Accuracy, and Time Taken. Users can review all questions with detailed, expandable explanations (including tone clues and trap words).
- **Admin Bulk Import Tool**: A robust admin interface for uploading and parsing markdown files containing multiple passages, questions, and explanations. Features a custom parser that accurately breaks down text into database records and an editable preview before finalizing the import.
- **Dynamic Filtering**: Easily filter Previous Year Questions (PYQs) by Year and Slot to jump straight into practice.
- **Robust Tech Stack**: Built with Next.js 15 (App Router), Drizzle ORM, Neon Postgres Serverless DB, Clerk for Authentication, and Tailwind CSS for styling.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env.local` file with the required environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`
   - `DATABASE_URL` (Neon Postgres)
   - `ADMIN_CLERK_IDS` (Comma-separated Clerk User IDs for admin access)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

This project uses Drizzle ORM for database schema management.

- Run `npm run db:push` to sync your schema with your Neon database.
- Run `npm run db:studio` to open Drizzle Studio and inspect your database directly.
