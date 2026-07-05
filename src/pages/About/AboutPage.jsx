import React from 'react'
import { Link } from 'react-router-dom'
import { mailto } from '../../constants/contact'
import {
  Sparkles, Github, Linkedin, Mail, ArrowRight, Check,
  Cloud, Brain, Wifi, GraduationCap, Award, Users,
  ExternalLink, Lightbulb, GitBranch, FileCode2, Minus,
  MapPin, Calendar, Code2, ShieldCheck
} from 'lucide-react'
import founderPhoto from '../../assets/Professional Photo (5).png'
import usePageTitle from '../../hooks/usePageTitle'

const AboutPage = () => {
  usePageTitle('About')

  const phaseMarkers = [
    { n: 1, label: 'Foundation', highlight: false },
    { n: 2, label: 'Design system', highlight: false },
    { n: 3, label: 'Refinement', highlight: false },
    { n: 4, label: 'API hardening', highlight: false },
    { n: 5, label: 'Visual unification', highlight: false },
    { n: 6, label: 'Streaming', highlight: false },
    { n: 7, label: 'Auth + persistence', highlight: false },
    { n: 8, label: 'Real-world context', highlight: true },
    { n: 9, label: 'Companion mode', highlight: true },
    { n: 10, label: 'Profile intelligence', highlight: true },
    { n: 11, label: 'Live trip + polish', highlight: false },
  ]

  const engineeringStory = [
    {
      phase: 'Phase 8',
      title: 'Real-world context',
      icon: <Cloud className="w-5 h-5" />,
      summary:
        'Grounding the LLM in live weather, currency, and geocoding — with deterministic fallbacks and full call observability.',
      bullets: [
        'Server-side weather fetch via Open-Meteo with 6-hour Postgres cache',
        'Forecast injected into the Groq system prompt so generation reflects real conditions',
        'OpenStreetMap Nominatim as fallback geocoder for ambiguous destinations',
        'Currency layer: LLM locked to USD, client converts at view time via cached FX rates',
        'Every Groq call logged with latency, tokens, status, and context flags',
      ],
      footer: '14-day forecast · 6-hour cache · ~400ms median round-trip',
    },
    {
      phase: 'Phase 9',
      title: 'Companion mode',
      icon: <Wifi className="w-5 h-5" />,
      summary:
        'The trip continues after generation — checked activities, actual costs, offline support, installable PWA.',
      bullets: [
        'Activity-level fields (checked, notes, actual cost) on JSONB',
        'Today detection auto-scrolls to the active day card during the trip',
        'Optimistic local updates with debounced background persistence',
        'Service worker caches app shell and opened trip data for offline access',
        'localStorage mutation queue replays writes when signal returns',
      ],
      footer: '~2,700 lines · 9 feature commits · 20/20 verification pass',
    },
    {
      phase: 'Phase 10',
      title: 'Profile intelligence',
      icon: <Brain className="w-5 h-5" />,
      summary:
        "Auriva learns your travel patterns from completed trips and uses them as input next time you generate.",
      bullets: [
        'Hybrid completion detection — auto-detect plus manual override',
        'Deterministic analytics: averages, category counts, top destinations',
        'Groq qualitative extraction: travel style, pace, budget archetype',
        'User overrides take priority over AI inference, persisted as JSONB',
        'Preferences injected into future generation prompts as grounded context',
      ],
      footer: 'Two-trip threshold · user overrides win · idempotent re-extraction',
    },
  ]

  const credentials = [
    {
      icon: <Award className="w-5 h-5" />,
      title: 'ImpactThon 2025-26 Grand Finalist',
      detail: '₹10,000 prototype grant · SwasthSathi rural healthcare screening',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Odoo × KSV Hackathon 2026',
      detail: 'Top 76 of 800+ teams · VendorBridge procurement ERP',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'AISEHack 2026 Phase 2 Qualifier',
      detail: 'Top 78 nationally · IBM Prithvi EO model fine-tuning',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'IEEE Student Branch KSV',
      detail: 'Co-Coordinator · Documentation & Report Committee',
    },
  ]

  const otherProjects = [
    {
      name: 'SwasthSathi',
      tagline: 'Multilingual rural health-risk screening',
      detail: 'ImpactThon Grand Finalist · ₹10,000 prototype grant',
      stack: 'Supabase · Google Cloud Vision · Anthropic Claude · Maps',
      link: 'https://github.com/ThakkarShlok',
    },
    {
      name: 'VendorBridge',
      tagline: 'Procurement & vendor management ERP',
      detail: 'Hackathon finalist · Top 76 of 800+ teams',
      stack: 'React 19 · Node + Express · Prisma · PostgreSQL · JWT',
      link: 'https://github.com/ThakkarShlok',
    },
    {
      name: 'SwiftCart',
      tagline: 'AI-assisted e-commerce platform',
      detail: 'Razorpay integration · PWA · live deployment',
      stack: 'React 19 · Vite · Tailwind · Vercel serverless · EmailJS',
      link: 'https://github.com/ThakkarShlok',
    },
  ]

  const scopeBoundaries = [
    {
      title: 'No bookings or payments',
      reason:
        'Plenty of platforms handle the transaction side well. Auriva stays focused on planning.',
    },
    {
      title: 'No real-time price scraping',
      reason:
        "Estimated costs come from the model. Directionally useful — not a meta-search guarantee.",
    },
    {
      title: 'No agentic auto-booking',
      reason:
        "Easiest to claim, hardest to ship safely. Not promising what isn't ready.",
    },
    {
      title: 'No invented metrics',
      reason:
        "If a number appears in the product, it's real or it isn't there.",
    },
  ]

  return (
    <div className="bg-white">
      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="hero-gradient relative overflow-hidden pt-16 md:pt-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl"
        />

        <div className="container-custom relative py-20 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              About this project
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Most AI travel tools stop helping{' '}
              <span className="text-amber-300">the moment they hand you the itinerary.</span>{' '}
              Auriva doesn't.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl">
              An open-source travel planner built solo across eleven phases, with a verification
              checklist before every release. It grounds the model in real weather, keeps
              working on the plane, and learns from trips you've actually taken.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 text-primary-100 text-sm bg-white/5 border border-white/15 rounded-lg px-4 py-2.5">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>
                <strong className="text-white font-semibold">The principle:</strong>{' '}
                LLM for creative reasoning, deterministic systems for grounded data.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY I BUILT THIS                                              */}
      {/* ============================================================ */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Why this project
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Asking an LLM to plan a trip is easy. Getting an itinerary worth using is the harder problem.
            </h2>

            <div className="mt-8 space-y-5 text-slate-700 leading-relaxed text-[17px]">
              <p>
                Generic AI tools generate plausible itineraries that fall apart the moment they
                meet reality. They don't know what the weather will do, they treat your trip as
                a conversation that gets buried in chat history, and they forget you exist the
                next time you plan one.
              </p>
              <p>
                Each of those is fixable — but only if you treat the LLM as one component of a
                larger system, not the whole product. Weather grounding is an API call before
                the prompt. Structured persistence is a Postgres schema, not a transcript.
                Memory is extracted patterns, not chat replay. None of those are big AI ideas.
                They're the gap between an itinerary and a useful one.
              </p>
              <p>
                Auriva is what closing that gap looks like, built end-to-end as a solo project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ENGINEERING STORY                                             */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              How it was built
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Eleven phases. Verification gate before every release.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Each phase shipped only after a 20-item verification checklist — covering schema
              migrations, API contracts, UI states, and edge cases. The full development
              history is in the commit log. Three phases below carry the architectural story
              most worth showing.
            </p>
          </div>

          {/* Phase timeline */}
          <div className="mb-12 bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary-700" />
                <span className="text-sm font-semibold text-slate-900">Phase timeline</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Phase 1 → 11</span>
            </div>

            <div className="relative">
              <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-slate-200" aria-hidden="true" />
              <div className="relative flex justify-between items-start">
                {phaseMarkers.map((marker) => (
                  <div key={marker.n} className="flex flex-col items-center gap-2 group">
                    <div
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        marker.highlight
                          ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-lg shadow-amber-400/30'
                          : 'bg-white border-slate-300 text-slate-500 group-hover:border-primary-400 group-hover:text-primary-700'
                      }`}
                      title={marker.label}
                    >
                      {marker.n}
                    </div>
                    <span
                      className={`text-[10px] font-medium text-center max-w-[60px] leading-tight hidden md:block ${
                        marker.highlight ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {marker.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full" />
                Phases 8 / 9 / 10 — the architectural moats, detailed below.
              </span>
            </p>
          </div>

          {/* Phase deep-dive cards */}
          <div className="space-y-5">
            {engineeringStory.map((phase, idx) => (
              <div
                key={phase.phase}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="md:grid md:grid-cols-12">
                  <div className="md:col-span-4 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white p-7 relative overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl"
                    />
                    <div className="relative">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-semibold">
                        {phase.phase}
                      </span>
                      <h3 className="text-2xl font-bold mt-2 leading-tight">{phase.title}</h3>
                      <div className="mt-5 w-11 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-300">
                        {phase.icon}
                      </div>
                      <p className="mt-5 text-sm text-primary-100 leading-relaxed">
                        {phase.summary}
                      </p>
                      <div className="absolute bottom-0 right-0 text-[11px] text-primary-300 font-mono">
                        0{idx + 1} / 03
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-8 bg-white flex flex-col">
                    <div className="p-7 flex-1">
                      <ul className="space-y-3">
                        {phase.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700">
                            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-[15px] leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-7 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-mono">
                      {phase.footer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-amber-50/50 border border-amber-200 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 flex-shrink-0 bg-white border border-amber-200 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold mb-1">Built incrementally, in public.</p>
              <p className="text-slate-700 text-[15px] leading-relaxed">
                Every architectural decision is documented in the commit log alongside its
                tradeoffs — including the ones that turned out wrong and got reversed. The
                repository is the development story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SCOPE                                                         */}
      {/* ============================================================ */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Scope, honestly
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              And a few things Auriva doesn't try to be.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Every product has shape. These are the directions deliberately not pushed in —
              either because someone else does them better, or because they wouldn't be honest
              to ship yet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {scopeBoundaries.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className="w-8 h-8 flex-shrink-0 bg-white border border-slate-200 rounded-md flex items-center justify-center">
                  <Minus className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE BUILDER                                                   */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Who built it
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Built end-to-end by one engineer.
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="lg:grid lg:grid-cols-12">
              <div className="lg:col-span-4 bg-gradient-to-br from-slate-50 to-slate-100 p-8 lg:p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 relative">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-3 bg-amber-400/20 rounded-2xl blur-xl"
                  />
                  <img
                    src={founderPhoto}
                    alt="Shlok Thakkar"
                    className="relative w-full max-w-[260px] rounded-2xl object-cover shadow-xl"
                    style={{ aspectRatio: '4/5' }}
                    onError={(e) => {
                      e.target.src =
                        'https://ui-avatars.com/api/?name=Shlok+Thakkar&background=3730a3&color=fff&size=400'
                    }}
                  />
                  <div className="absolute -bottom-3 -right-3 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-lg inline-flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span className="text-slate-700 font-medium">Ahmedabad, IN</span>
                  </div>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Graduating 2028 · Open to SWE roles
                </div>
              </div>

              <div className="lg:col-span-8 p-8 lg:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Shlok Thakkar</h3>
                <p className="text-primary-700 font-medium mt-1 flex items-center gap-2 flex-wrap text-sm">
                  <GraduationCap className="w-4 h-4" />
                  <span>Third-year Computer Engineering · LDRP-ITR / KSV University</span>
                </p>

                <div className="mt-5 space-y-4 text-slate-700 leading-relaxed text-[15px]">
                  <p>
                    Engineering student who builds things end-to-end. I split time between DSA
                    and shipping production-grade projects — Auriva is one of four, alongside a
                    healthcare screening tool, a procurement ERP, and an AI-assisted
                    e-commerce platform. Each is live, each has real users or judging panels
                    behind it. Targeting a software engineering role at a top company by
                    graduation.
                  </p>
                  <p>
                    Recent recognition: ImpactThon Grand Finalist with a ₹10,000 prototype
                    grant (SwasthSathi), Top 76 of 800+ teams at the Odoo × KSV Hackathon 2026
                    (VendorBridge), and Phase 2 qualifier at AISEHack 2026 (Top 78 nationally)
                    fine-tuning IBM's Prithvi Earth Observation model on satellite imagery.
                    Co-Coordinator at IEEE Student Branch KSV.
                  </p>
                </div>

                <div className="mt-7 grid sm:grid-cols-2 gap-3">
                  {credentials.map((cred) => (
                    <div
                      key={cred.title}
                      className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-white transition-colors"
                    >
                      <div className="w-8 h-8 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-center text-amber-700">
                        {cred.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{cred.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cred.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="https://github.com/ThakkarShlok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/shlok-thakkar-58a033354"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-800 border border-slate-300 rounded-lg hover:border-primary-400 hover:text-primary-700 transition-colors text-sm font-medium"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a
                    href={mailto()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-800 border border-slate-300 rounded-lg hover:border-primary-400 hover:text-primary-700 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* OTHER PROJECTS                                                */}
      {/* ============================================================ */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              The other three
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Auriva is one of four. Each is worth a look.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Different domains, different stacks, all production-grade. Each one shipped past
              the prototype stage with real adoption signals — a grant, a hackathon ranking, a
              live deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {otherProjects.map((project) => (
              <a
                key={project.name}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-primary-200 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-primary-700 group-hover:text-primary-800 transition-colors" />
                    <h3 className="font-bold text-slate-900 text-lg">{project.name}</h3>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-700 transition-colors" />
                </div>
                <p className="text-slate-700 text-sm font-medium">{project.tagline}</p>
                <p className="text-slate-500 text-xs mt-1">{project.detail}</p>
                <p className="mt-auto pt-4 border-t border-slate-200 group-hover:border-slate-300 text-xs text-slate-500 font-mono transition-colors">
                  {project.stack}
                </p>
              </a>
            ))}
          </div>

          <p className="mt-8 text-sm text-slate-500 text-center">
            See all repos on{' '}
            <a
              href="https://github.com/ThakkarShlok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 hover:text-primary-800 font-medium inline-flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                           */}
      {/* ============================================================ */}
      <section className="hero-gradient py-20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
        />
        <div className="container-custom relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Try it. Read the code. Get in touch.
          </h2>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto text-lg">
            The fastest way to evaluate Auriva is to use it. The next fastest is to read the
            source.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/plan"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 hover:-translate-y-0.5 transition-all shadow-lg"
            >
              Plan a trip
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/ThakkarShlok"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-transparent border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-transparent border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
