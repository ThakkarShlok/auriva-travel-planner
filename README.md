# Auriva — AI Travel Planner

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev/)

AI-powered travel itinerary generator. Enter a destination, duration, budget, and interests — Auriva streams a personalised day-by-day plan and lets you refine it conversationally.

## What it does

- Fill in a destination, duration, budget, and interests on the Onboarding page
- The app streams a day-by-day itinerary in real time using Server-Sent Events (Groq → SSE → client)
- Refine the result conversationally via the sidebar chat panel
- Save trips to your account, duplicate, or delete them from the Dashboard
- An AI chat assistant can answer follow-up travel questions

## Tech stack

| | |
|---|---|
| Frontend | React 18, Vite 5, React Router v6 |
| State | Redux Toolkit |
| Styling | Tailwind CSS v3, custom design tokens |
| Auth | Clerk (email/password, Google OAuth, GitHub OAuth) |
| Database | Neon serverless Postgres + Drizzle ORM |
| AI | Groq (Llama 3.3 70B for itineraries, Llama 3.1 8B for chat) |
| Icons | Lucide React |
| Deployment | Vercel |

## Local development setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com |
| `DATABASE_URL` | Neon dashboard → Connection Details → Pooled connection string |
| `DATABASE_URL_UNPOOLED` | Neon dashboard → Connection Details → Direct connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Added after webhook setup — see below |

### 3. Push the database schema

```bash
npm run db:push
```

Verify in the Neon SQL editor — `SELECT * FROM users;` should return 0 rows with the table created.

### 4. Start the dev server

```bash
npm run dev
```

API routes are served by a Vite plugin — no separate server process or `vercel dev` needed.

## Authentication and database

### Schema commands

```bash
npm run db:push       # sync schema directly to database (development)
npm run db:generate   # generate SQL migration files from schema changes
npm run db:migrate    # apply pending migration files (production workflow)
npm run db:studio     # open Drizzle Studio at http://localhost:4983
```

Use `db:push` for rapid iteration. Use `db:generate` + `db:migrate` for production deployments.

### Webhook setup (one-time)

Clerk fires webhook events when users sign up or update their profile. The `/api/webhooks/clerk` endpoint mirrors these into the local `users` table.

**Local development with ngrok:**

1. `npx ngrok http 5174`
2. Clerk Dashboard → Webhooks → Add Endpoint → paste the ngrok HTTPS URL + `/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret (`whsec_...`) into `.env.local` as `CLERK_WEBHOOK_SECRET`

**Note:** The app works without webhooks configured. Users can sign in/out via Clerk. The webhook only ensures the local `users` table stays in sync. Phase 7B (trip persistence) requires it.

### Why these choices

- **Neon**: Free tier doesn't auto-pause. First-class serverless pooling and database branching.
- **Clerk**: Production-grade auth with OAuth flows, session management, MFA, and account linking out of the box.
- **Drizzle**: TypeScript-first schema-as-code, lighter runtime than Prisma, explicit Neon driver support.

## Project structure

```
src/
  components/      UI primitives, layout, chatbot, refinement panel
  db/              Drizzle schema (schema.js) + database client (index.js)
  hooks/           usePageTitle, useDebounce
  pages/           Route-level page components
  routes/          PrivateRoute guard (Clerk-backed)
  services/        API clients — streaming, groq, localStorage
  store/           Redux slices — trip, auth (Phase 7B stub)
api/
  _lib/groq.js     Shared Groq key assertion
  webhooks/        Clerk webhook handler
  *.js             API route handlers
drizzle/           Generated SQL migration files
```

## Health check

```bash
curl http://localhost:5174/api/health
```

Returns `ok: true` when all four checks (Groq key, DATABASE_URL, CLERK_SECRET_KEY, database connection) are healthy.

## Contact

Shlok Thakkar — [thakkarshlok2007@gmail.com](mailto:thakkarshlok2007@gmail.com)

GitHub: [@ThakkarShlok](https://github.com/ThakkarShlok) · LinkedIn: [Shlok Thakkar](https://www.linkedin.com/in/shlok-thakkar-58a033354)
