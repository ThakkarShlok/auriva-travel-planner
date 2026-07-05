<div align="center">

# Auriva

### An AI travel planner you can actually use *during* the trip.

Generates day-by-day itineraries grounded in real weather, persists structured trip data, works offline, and learns from completed trips.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Postgres](https://img.shields.io/badge/Neon-Postgres-00e599?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-f55036)](https://groq.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff)](https://clerk.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel&logoColor=white)](https://vercel.com/)

**[Live demo](https://auriva.app)** &nbsp;·&nbsp; **[About the project](https://auriva.app/about)** &nbsp;·&nbsp; **[Phase reports](#phase-reports)**

</div>

---

## What it is

Most AI travel tools stop helping the moment they hand you the itinerary. Auriva keeps going.

It writes day-by-day itineraries grounded in the real 14-day forecast for your destination, persists every trip as typed Postgres rows (not chat history), works offline on the plane via a service worker, and after two completed trips extracts your travel patterns to ground future generations.

**Architectural principle:** *LLM for creative reasoning. Deterministic systems for grounded data.* Weather, currency, and geocoding aren't AI capabilities — they're API calls that happen *before* the prompt. The AI sees the real conditions and reasons inside them.

---

## What makes it different

| | What Auriva does |
|---|---|
| **Grounded in real weather** | Fetches the destination's 14-day forecast server-side, caches for 6 hours, and injects it into the system prompt before generation. Rain on day three? Indoor swaps appear — not because the model guessed, because the data was in the prompt. |
| **Designed for during the trip** | Check off activities, log actual costs vs. estimated, take notes — all offline-capable via a service worker. Mutations queue in localStorage and replay when signal returns. Installable as a PWA. |
| **Structured memory, not chat history** | Every trip is a typed Postgres row, not a fuzzy conversation log. After two completed trips, Auriva extracts pace, budget tendency, and category preferences via a deterministic-stats pass plus a Groq qualitative-extraction pass, and uses them as input next time. User overrides win. |
| **Live trip mode** | Once a trip is active: 3-day forecast auto-refreshes on the today card, exchange rates are captured at the moment of cost entry (immutable history), and an opt-in "Find nearest activity" hint surfaces the closest item by browser geolocation. |
| **Multi-currency, single source of truth** | LLM is locked to USD. Client converts at view time using cached FX rates. INR is the default for India users; USD is toggleable. PDFs always render in USD with an explicit label. |
| **Built-in observability** | Every Groq call is logged with model, latency, tokens, status, and context flags. Admin dashboard at `/admin/metrics` (email-gated) shows a 7-day summary, daily volume, endpoint breakdown, and recent log stream. |

---

## Phase reports

Auriva shipped across **eleven phases**. Each one had a 20-item verification checklist before release.

| Phase | Title | What landed |
|---|---|---|
| 1 | Foundation | Project rename (voyage → Auriva), dead-code purge, naming-convention pass, UUID-based IDs replacing `Date.now()` |
| 2 – 3 | Design system | Tailwind tokens; primitives (`PageHeader`, `Card`, `Section`, `Button` variants, `StatsBand`, `FeatureGrid`, `TimelineDay`); utility classes (`hero-gradient`, `container-custom`, `section-padding`) |
| 4 | API hardening | Custom Vite `apiPlugin` so a single `npm run dev` runs everything; `assertGroqKey` BOM/whitespace validation; outer try/catch making `FUNCTION_INVOCATION_FAILED` impossible |
| 5 | Visual unification | Indigo + amber + slate palette enforced across every page; one hero + one warm CTA per page; restraint principle codified |
| 6 | Streaming | SSE itinerary generation; `partial-json` progressive parsing; refinement endpoint; `RefinementPanel` (desktop sidebar / mobile bottom-sheet); `AbortController` cleanup |
| 7 | Auth + persistence | Clerk auth (email + Google + GitHub); zero-dep JWT verification against JWKS; Neon Postgres + Drizzle ORM; trip / day / conversation persistence; public-share endpoints; OG meta tags |
| **8** | **Real-world context** | **Open-Meteo weather grounding, Nominatim geocoding fallback, FX-rate currency layer, generation-call observability with admin metrics dashboard** |
| **9** | **Companion mode** | **Trip start dates, activity-level fields (checked / notes / actual cost), today-detection auto-scroll, service-worker offline cache, localStorage mutation queue, installable PWA** |
| **10** | **Profile intelligence** | **Hybrid trip-completion detection, deterministic analytics, Groq qualitative preference extraction, user-overrideable inference, preference injection into future generations** |
| 11a | Live trip mode | Live weather refresh on today's card; timestamp-anchored FX-rate capture on actual cost entry; opt-in geolocation "nearest activity" hint |
| 11b | UI/UX polish | Bento-grid hero, featured-trip card on Dashboard, editorial layout on Discover, skeleton loaders, focus rings, print-friendly itinerary mode |

The three **bolded** phases carry the architectural story. The rest are foundation, hardening, and polish.

---

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | React 18 · Vite 5 · React Router 6 · Redux Toolkit · Tailwind CSS v3 · Lucide icons |
| **API runtime** | Vercel serverless functions (custom Vite `apiPlugin` in dev — no `vercel dev` required) |
| **Database** | Neon Postgres 17 · Drizzle ORM · `@neondatabase/serverless` HTTP driver |
| **Auth** | Clerk (email + Google + GitHub OAuth) · zero-dep JWT verification with cached JWKS |
| **AI** | Groq inference · `llama-3.3-70b-versatile` (itineraries, JSON mode, SSE streaming) · `llama-3.1-8b-instant` (chat) |
| **Real-world data** | Open-Meteo (weather) · OpenStreetMap Nominatim (geocoding fallback) · open.er-api.com (FX rates) |
| **PWA + offline** | Custom service worker · localStorage mutation queue · `online`/`offline` event subscription |
| **Email** | EmailJS (browser-side, Gmail integration, no domain verification required) |
| **PDF** | `@react-pdf/renderer` server-side · Inter font · indigo/amber palette |
| **Hosting** | Vercel (frontend + serverless API) · Neon (database, AWS ap-south-1 Mumbai) |

### Why these choices

- **Neon over Supabase** — first-class serverless pooling, database branching, free tier doesn't auto-pause.
- **Drizzle over Prisma** — TypeScript-first schema-as-code, lighter runtime, explicit Neon HTTP driver support. Tradeoff accepted: no transactions on the HTTP driver, so all writes are sequential `await`s.
- **Clerk over rolling auth** — production-grade OAuth, MFA, and account linking out of the box. The boring stuff is hard to get right.
- **Groq over OpenAI** — order-of-magnitude faster inference at comparable quality for itinerary generation. Llama 3.3 70B is the sweet spot for cost/quality.
- **EmailJS over Resend/SendGrid** — completely free for portfolio use, no domain verification, Gmail integration in five minutes. Originally tried Resend; hit the unverified-recipient block on the free tier, migrated. Documented in the commit history.
- **Custom Vite `apiPlugin` over `vercel dev`** — `vercel dev` had Windows IPC issues that cost a day; a small Vite plugin solved it permanently and shaved 4 seconds off cold-start.

---

## Quick start

### Prerequisites

- Node 18+
- A Neon project (free tier is enough)
- A Clerk application (free tier is enough)
- A Groq API key (free tier is enough)

### 1. Clone and install

```bash
git clone https://github.com/ThakkarShlok/auriva.git
cd auriva
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Required variables:

```bash
GROQ_API_KEY=gsk_...                    # console.groq.com
DATABASE_URL=postgresql://...           # Neon → Connection Details → Pooled
DATABASE_URL_UNPOOLED=postgresql://...  # Neon → Direct (no -pooler in hostname)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Clerk → API Keys
CLERK_SECRET_KEY=sk_test_...            # Clerk → API Keys
```

Optional variables:

```bash
CLERK_WEBHOOK_SECRET=whsec_...          # only needed in production with webhooks
VITE_EMAILJS_SERVICE_ID=service_...     # email delivery + contact form
VITE_EMAILJS_PUBLIC_KEY=...
VITE_EMAILJS_TEMPLATE_TRIP=template_...
VITE_EMAILJS_TEMPLATE_CONTACT=template_...
ADMIN_EMAILS=you@example.com            # server-side admin gate for /admin/metrics
VITE_ADMIN_EMAILS=you@example.com       # client-side admin UI render check
```

> **`.env.local` BOM warning:** if PowerShell created the file via `echo`, it may have a UTF-8 BOM. Verify with `xxd .env.local | head -3` — the first bytes should be the env var name, never `ef bb bf`. If BOM is present, rewrite with `printf 'GROQ_API_KEY=...\n' > .env.local`.

### 3. Push the database schema

```bash
npm run db:push
```

Verify in the Neon SQL editor — `SELECT * FROM users;` should return zero rows with the table created.

### 4. Start the dev server

```bash
npm run dev
```

Both frontend and API routes run together on a single port — the Vite `apiPlugin` handles `/api/*` requests in dev so there's no separate server process.

### 5. Health check

```bash
curl http://localhost:5174/api/health
```

Returns `ok: true` when all four checks pass (Groq key, `DATABASE_URL`, `CLERK_SECRET_KEY`, database connection).

---

## Database commands

```bash
npm run db:push       # sync schema directly to database (use during development)
npm run db:generate   # generate SQL migration files from schema changes
npm run db:migrate    # apply pending migration files (production workflow)
npm run db:studio     # open Drizzle Studio at http://localhost:4983
```

Use `db:push` for rapid iteration. Use `db:generate` + `db:migrate` for production deployments.

---

## Clerk webhook setup (optional)

Auriva works without webhooks — users can sign in/out via Clerk and trips persist correctly. The webhook only ensures the local `users` table stays in sync with Clerk's source of truth (helpful for analytics and admin tooling).

**Local dev with ngrok:**

```bash
npx ngrok http 5174
```

1. Clerk Dashboard → Webhooks → Add Endpoint → paste the ngrok HTTPS URL + `/api/webhooks/clerk`
2. Subscribe to `user.created`, `user.updated`, `user.deleted`
3. Copy the signing secret into `.env.local` as `CLERK_WEBHOOK_SECRET`

---

## EmailJS setup (optional)

EmailJS handles trip delivery and contact form submissions browser-side — no domain verification required and no backend SMTP credentials to manage.

### One-time setup

1. Sign up at [emailjs.com](https://www.emailjs.com) (free tier: 200 emails/month)
2. **Email Services** → Add → Gmail → connect `support.auriva@gmail.com` (or your own)
3. Create two templates:

<details>
<summary><strong>Template 1 — <code>trip_itinerary</code></strong> (what recipients see when you email them a trip)</summary>

**Subject:** `Your {{trip_duration}}-day trip to {{trip_destination}}`

**Reply-To:** `{{reply_to}}` (so replies go to the sender, not Auriva)

**Body (HTML):**
```html
<p>Hi {{to_name}},</p>
<p>Here's your AI-generated itinerary for <strong>{{trip_destination}}</strong>:</p>
<p><strong>{{trip_duration}} days</strong> · {{trip_travelers}} travelers · {{trip_budget}} budget</p>
<p>{{trip_overview}}</p>
<p><a href="{{share_url}}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View full itinerary</a></p>
<p style="color:#94a3b8;font-size:12px;">Generated by Auriva</p>
```
</details>

<details>
<summary><strong>Template 2 — <code>contact_form</code></strong> (what you receive when someone uses the contact page)</summary>

**Subject:** `[Auriva Contact] {{subject}}`

**Reply-To:** `{{reply_to}}` (so Gmail Reply goes to the user, not yourself)

**Body:**
```
New contact form submission:

From: {{from_name}} <{{from_email}}>
Subject: {{subject}}

{{message}}
```
</details>

4. Add credentials to `.env.local` (see the optional block above).

### Architecture note

EmailJS is browser-side — the `VITE_EMAILJS_PUBLIC_KEY` is intentionally client-visible (that's how EmailJS works). Sensitive operations (PDF generation, trip data reads) remain server-side via `/api/download-pdf` and gated database queries.

---

## Project structure

```
src/
├─ components/        UI primitives (Card, Section, Button, ...)
│  ├─ Companion/      Today badge, activity checkbox, notes, cost input, geolocation
│  ├─ Layout/         Navbar, footer, currency toggle
│  ├─ Refinement/     Conversational itinerary editor (sidebar + bottom-sheet)
│  └─ Sharing/        Share modal with native share + EmailJS fallback
├─ contexts/          CurrencyContext (USD ↔ INR toggle, localStorage-persisted)
├─ db/                Drizzle schema + Neon HTTP client + per-domain queries
├─ hooks/             usePageTitle, useDebounce, useOnlineStatus, useGeolocation, useLiveWeatherRefresh
├─ pages/             Route-level pages (Home, About, Planner, ItineraryDetail, ...)
├─ pdf/               TripPDFDocument — server-side @react-pdf/renderer
├─ services/          API clients (streaming, trips, preferences, email)
├─ store/             Redux slices (trip, auth, preferences)
└─ utils/             tripAnalytics, currency, dates, geo, mutationQueue
api/
├─ _lib/              groq.js (key validation + GroqError), auth.js (JWT verify)
├─ admin/             metrics.js (email-gated dashboard data)
├─ preferences/       extract.js, index.js (Phase 10)
├─ trips/             [id].js, duplicate.js, index.js
├─ weather/           refresh.js (Phase 11a live refresh)
├─ webhooks/          clerk.js
└─ *.js               generate-itinerary-stream.js, refine-itinerary.js, download-pdf.js, ...
public/
├─ sw.js              Service worker (cache-first shell, network-first trip data)
└─ manifest.webmanifest
scripts/
├─ run-migration-phase8.mjs
├─ run-migration-phase9.mjs
├─ run-migration-phase10.mjs
├─ run-migration-phase11a.mjs
└─ backfill-weather.mjs
```

---

## Admin metrics

Add your Clerk email to both server-side and client-side env vars:

```bash
ADMIN_EMAILS=your@email.com           # server-side authorization (the actual security boundary)
VITE_ADMIN_EMAILS=your@email.com      # client-side UI render check
```

Sign in with that email and visit `/admin/metrics`. The page shows:

- 7-day summary (total generations, errors, median latency, total tokens)
- 14-day daily volume bar chart
- Endpoint breakdown table (`/api/generate-itinerary-stream`, `/api/refine-itinerary`, `/api/chat`)
- Recent generation log with model, latency, status, and context flags

Both client-side rendering and server-side authorization check the email allowlist independently.

---

## Live trip mode (Phase 11a)

Three subsystems improve the "today" experience once a trip is active.

**Live weather refresh.** When the user opens a trip whose date range includes today, the day card silently re-fetches a fresh 3-day forecast on mount and overlays it on the day header. The historical 14-day JSONB on the trip row is never overwritten (preserved as the grounding record for the original generation). A small "Updated *N*m ago" chip appears in the header; failures are silent and non-blocking.

**Timestamp-anchored exchange rates.** When the user enters an actual cost, Auriva captures the exact USD→INR rate at that moment alongside an ISO timestamp, and stores both on the activity JSONB (`actualCostUsdRate`, `actualCostCapturedAt`). Revisiting the trip months later shows the same delta even if the FX rate has moved — recorded history is immutable. Old entries without captured rates fall back to the live cached rate transparently.

**Opt-in "Where am I" hint.** An explicit "Find nearest activity" button appears on today's card when the itinerary contains activities with coordinates (Groq emits lat/lng at generation time as of Phase 11a). Tapping it triggers a one-shot `getCurrentPosition`. If an activity is within 5 km, an amber "You're near [Activity] · *distance*" pill appears. Geolocation is never auto-requested, never persisted, and dismissing it writes a session flag so the prompt stays gone for the browser session.

---

## Contact

[Email](mailto:support.auriva@gmail.com) &nbsp;·&nbsp; [GitHub @ThakkarShlok](https://github.com/ThakkarShlok) &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/shlok-thakkar-58a033354) &nbsp;·&nbsp; WhatsApp: +91 81286 98935

---

<div align="center">

*Built by Shlok Thakkar — third-year Computer Engineering, LDRP-ITR / KSV University.*

</div>