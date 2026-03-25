# AI QA Assistant

AI QA Assistant is an AI-powered QA artifact generator for real-world workflows. It transforms raw requirements and feature descriptions into structured artifacts (Test Cases, Checklists, Bug Report drafts, API Test Ideas) with a mandatory human-in-the-loop review flow and explainability.

Demo Mode is available instantly for recruiters/interviewers via a **read-only Demo Project**.

## Demo
You can explore the app without creating an account:
- `/demo/test-cases`
- `/demo/checklist`
- `/demo/bug-report`
- `/demo/api-ideas`

## Why It's Cool
- Human-in-the-loop review: generated items start as `PENDING` and can be `ACCEPTED` or `REJECTED`
- Coverage + Quality Analyzer: score, strengths/weaknesses/suggestions, plus explainability persisted in PostgreSQL
- Improve with AI: generate upgrades using AI and preview changes before applying
- Traceability: every artifact includes evidence/assumptions/risk notes for justification
- Export-ready: exports are generated from **ACCEPTED** items only (Markdown/CSV/plain text depending on artifact type)
- Guest mode with usage limits + generator lock-in for the first chosen generator type

## Tech Stack
- Frontend: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers + Zod validation
- Database: PostgreSQL + Prisma ORM (migrations + seed)
- Auth: NextAuth Credentials provider + guest sessions
- AI: OpenAI API (centralized in `lib/ai/service.ts`)

## How to Run Locally
### 1) Clone the repository
```bash
git clone https://github.com/Bogdusik/AI-QA-Assistant.git
cd AI-QA-Assistant
```

### 2) Install dependencies
```bash
npm ci
```

### 3) Configure environment variables
Create your local env file:
```bash
cp .env.example .env
```
Then update `.env` with your own PostgreSQL + OpenAI credentials.

### 4) Set up the database (Prisma)
Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations (development):
```bash
npm run prisma:migrate
```

Seed demo data:
```bash
npm run prisma:seed
```

### 5) Start the app
```bash
npm run dev
```
Open:
- App: http://localhost:3000
- Demo: http://localhost:3000/demo

Important: Never hardcode secrets. Do not commit `.env` to GitHub.

## Deploying to Vercel
### 1) Connect the repo
In Vercel: GitHub → select `Bogdusik/AI-QA-Assistant` → branch `main`.

### 2) Add Environment Variables
Set the same values as in your `.env` (without committing them), specifically:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `UPLOAD_DIR`
- `GUEST_USAGE_LIMIT`

### 3) Vercel build commands
Recommended settings:
- **Install Command**: `npm ci`
- **Build Command**: `npm run build:vercel`

`build:vercel` runs:
1) `prisma generate`
2) `prisma migrate deploy`
3) `prisma seed`
4) `next build`

## Snyk / Security (MVP Notes)
- All user inputs are validated on API routes using Zod.
- Updates/exports are guarded with ownership checks (and Demo mode is read-only).
- Secrets are stored in environment variables, not in code.
- AI outputs are schema-validated and normalized before persisting.

## Project Structure
```txt
AI-QA-Assistant/
├── app/                    # Next.js routes (App Router)
├── components/            # Reusable UI + layout
├── features/             # Feature-specific UI/data
├── lib/                  # AI, auth, DB, exports, file handling
├── prisma/               # schema + migrations + seed
├── uploads/              # runtime upload storage (local-only in MVP)
└── [config files]       # next.config, tsconfig, tailwind config
```

## Documentation
- API + real endpoint examples are in the `API Practice Pack` page: `/api-practice`
- SQL + QA-focused SQL exercises use the real Prisma models: `/sql-practice`

## What I Learned
- Full-stack TypeScript with type-safe inputs and validated AI responses
- Human-in-the-loop UX patterns for reviewable AI outputs
- Reliable Prisma workflow: migrations + seed + explainability persistence

Fork it, use it, improve it - open to PRs!
