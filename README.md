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
| `RESEND_API_KEY` | https://resend.com → API Keys (optional — enables email delivery + contact form) |

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

## EmailJS setup

Auriva uses [EmailJS](https://www.emailjs.com) for transactional emails (trip delivery + contact form). EmailJS sends through your connected Gmail account directly from the browser — no domain verification required, no server needed for email.

### One-time setup

1. Sign up at https://www.emailjs.com (free: 200 emails/month)
2. **Add Email Service**: Dashboard → Email Services → Add → Gmail → connect your Gmail
3. **Create two templates**:

   **Template 1 — `trip_itinerary`** (what recipients get when you email them a trip):
   - To Email: `{{to_email}}`
   - From Name: Auriva
   - Reply-To: `{{reply_to}}`
   - Subject: `Your {{trip_duration}}-day trip to {{trip_destination}}`
   - Body (HTML):
     ```html
     <p>Hi {{to_name}},</p>
     <p>Here's your AI-generated itinerary for <strong>{{trip_destination}}</strong>:</p>
     <p><strong>{{trip_duration}} days</strong> · {{trip_travelers}} travelers · {{trip_budget}} budget</p>
     <p>{{trip_overview}}</p>
     <p><a href="{{share_url}}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View full itinerary</a></p>
     <p>You can download a PDF copy from the trip page.</p>
     <p style="color:#94a3b8;font-size:12px;">Generated by Auriva — AI Travel Strategist</p>
     ```

   **Template 2 — `contact_form`** (what you receive when someone contacts you):
   - To Email: `{{to_email}}` → will receive `support.auriva@gmail.com`
   - From Name: `{{from_name}}`
   - Reply-To: `{{reply_to}}` → user's email, so Gmail Reply goes directly to them
   - Subject: `[Auriva Contact] {{subject}}`
   - Body:
     ```
     New contact form submission:

     From: {{from_name}} <{{from_email}}>
     Subject: {{subject}}

     {{message}}
     ```

4. **Get credentials** from the dashboard:
   - Service ID → Email Services tab
   - Public Key → Account → API Keys
   - Template IDs → Email Templates tab (one per template)

5. **Add to `.env.local`**:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_EMAILJS_TEMPLATE_TRIP=template_xxxxx
   VITE_EMAILJS_TEMPLATE_CONTACT=template_yyyyy
   ```

### Architecture note

EmailJS is browser-side — the `VITE_EMAILJS_PUBLIC_KEY` is intentionally client-visible (that's how EmailJS works). Sensitive operations (PDF generation, trip data reads) remain server-side via `/api/download-pdf`.

<!-- TODO Phase 10: rate-limit contact form on client side (e.g. disable button for 60s after submit) to discourage spam -->

## Contact

- Email: [support.auriva@gmail.com](mailto:support.auriva@gmail.com)
- WhatsApp: +91 81286 98935
- GitHub: [@ThakkarShlok](https://github.com/ThakkarShlok)
- LinkedIn: [Shlok Thakkar](https://www.linkedin.com/in/shlok-thakkar-58a033354)
