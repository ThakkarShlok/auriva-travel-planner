import React from 'react';
import { Link } from 'react-router-dom';
import { mailto } from '../../constants/contact';
import {
  Sparkles, Github, Linkedin, Mail, ArrowRight, Check,
  Cloud, Brain, Wifi, GraduationCap, Award, Users,
  ExternalLink, Lightbulb, GitBranch, FileCode2, Minus
} from 'lucide-react';
import founderPhoto from '../../assets/Professional Photo (5).png';
import usePageTitle from '../../hooks/usePageTitle';

const AboutPage = () => {
  usePageTitle('About');

  const engineeringStory = [
    {
      phase: 'Phase 8',
      title: 'Real-world context',
      icon: <Cloud className="w-5 h-5" />,
      bullets: [
        'Server-side weather fetch via Open-Meteo (free, keyless, 14-day forecast)',
        '6-hour Postgres cache; injected into the Groq system prompt before generation',
        'OpenStreetMap Nominatim as a fallback geocoder for ambiguous destinations',
        'Currency layer: LLM locked to USD, client converts at view time via cached FX rates',
        'Observability: every Groq call logged with latency, tokens, status, context flags',
      ],
    },
    {
      phase: 'Phase 9',
      title: 'Companion mode',
      icon: <Wifi className="w-5 h-5" />,
      bullets: [
        'Trip start date + activity-level fields (checked, notes, actual cost)',
        '"Today" detection auto-scrolls to the active day card during the trip',
        'Optimistic local updates with debounced background persistence',
        'Service worker caches app shell + opened trip JSON for offline access',
        'localStorage-backed mutation queue replays writes on reconnect',
      ],
    },
    {
      phase: 'Phase 10',
      title: 'Profile intelligence',
      icon: <Brain className="w-5 h-5" />,
      bullets: [
        'Hybrid trip-completion detection: auto-detection + manual override',
        'Deterministic analytics (averages, category counts) from completed trips',
        'Groq qualitative extraction: travel style, pace preference, budget archetype',
        'User overrides take priority over AI inference, persisted as JSONB',
        'Preferences injected into future itinerary prompts as grounded context',
      ],
    },
  ];

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
      title: 'AISEHack 2026 Phase 2',
      detail: 'Qualified for offline finals · IBM Prithvi EO model fine-tuning',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'IEEE Student Branch KSV',
      detail: 'Co-Coordinator · Documentation & Report Committee',
    },
  ];

  const otherProjects = [
    {
      name: 'SwasthSathi',
      tagline: 'Multilingual rural health-risk screening · ImpactThon grant recipient',
      stack: 'Supabase · Google Cloud Vision · LLM-powered recommendations',
    },
    {
      name: 'VendorBridge',
      tagline: 'Procurement & vendor management ERP · Hackathon finalist',
      stack: 'React 19 · Node + Express · Prisma · PostgreSQL · JWT',
    },
    {
      name: 'SwiftCart',
      tagline: 'AI-assisted e-commerce with Razorpay + PWA',
      stack: 'React 19 · Vite · Tailwind · Vercel serverless · EmailJS',
    },
  ];

  // Non-goals — kept, but neutrally framed and placed at the end
  const scopeBoundaries = [
    {
      title: 'No bookings, no payments',
      reason:
        'Plenty of platforms handle the transaction side well. Auriva stays focused on planning.',
    },
    {
      title: 'No real-time price scraping',
      reason:
        "Estimated costs come from the model. Directionally useful for budgeting — not a meta-search guarantee.",
    },
    {
      title: 'No agentic auto-booking',
      reason:
        "Agentic booking is the easiest thing to claim and the hardest to ship safely. Not promising what isn't ready.",
    },
    {
      title: 'No invented metrics',
      reason:
        "If a number appears in the product, it's real or it isn't there.",
    },
  ];

  return (
    <div className="bg-white">
      {/* HERO — human-toned, no AI tagline patterns */}
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
        <div className="container-custom relative py-20 md:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              About this project
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              I built Auriva because most AI{' '}
              <span className="text-amber-300">travel tools stop helping the moment they hand you the itinerary.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-primary-100 leading-relaxed max-w-3xl">
              This is an open-source travel planner I built solo, over ten phases, while finishing
              second year. It grounds the model in real weather, keeps working on the plane, and
              learns from trips you've actually taken.
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

      {/* WHAT AURIVA DOES — lead with capability */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              What it does
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Three things, done deliberately.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Generic AI tools can write an itinerary. The harder problem — and the one Auriva
              actually solves — is grounding the output in real-world data, keeping it useful
              during the trip, and using what happened to improve the next one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-4 text-primary-700">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Grounded itineraries</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                The destination's 14-day forecast is fetched server-side and injected into the
                prompt before generation. The model sees the weather; you see indoor swaps on
                rainy days.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-4 text-primary-700">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Companion mode</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Check off activities. Log actual costs vs. estimated. Take notes. The app works
                offline via service worker, and mutations queue in localStorage until you're
                back online.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-4 text-primary-700">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Profile intelligence</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                After two completed trips, Auriva extracts patterns — pace, budget tendency,
                category preferences — and uses them as input for future generations. Override
                anything you disagree with.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ENGINEERING STORY */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              How it was built
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Ten phases. Branch per phase. Verification before merge.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Each phase shipped on its own branch with a 20-item checklist before being
              accepted. The three most important ones — what they did, what they cost — are
              below.
            </p>
          </div>

          <div className="space-y-5">
            {engineeringStory.map((phase, idx) => (
              <div
                key={phase.phase}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="md:grid md:grid-cols-12">
                  <div className="md:col-span-4 bg-gradient-to-br from-primary-700 to-primary-900 text-white p-7 relative">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-semibold">
                      {phase.phase}
                    </span>
                    <h3 className="text-2xl font-bold mt-2">{phase.title}</h3>
                    <div className="mt-6 w-11 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-300">
                      {phase.icon}
                    </div>
                    <div className="absolute bottom-7 left-7 text-[11px] text-primary-200 font-mono">
                      0{idx + 1} / 03
                    </div>
                  </div>

                  <div className="md:col-span-8 p-7">
                    <ul className="space-y-3">
                      {phase.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-[15px] leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white border border-slate-200 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold mb-1">Built incrementally, in public.</p>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                The commit history is the development story. Every architectural decision —
                including the ones that turned out wrong and got reversed — is in there with
                its tradeoffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE BUILDER */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Who built it
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Solo project. One person.
            </h2>
          </div>

          <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
            <div className="lg:grid lg:grid-cols-12">
              <div className="lg:col-span-4 bg-white p-8 lg:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-3 bg-amber-400/20 rounded-2xl blur-xl"
                  />
                  <img
                    src={founderPhoto}
                    alt="Shlok Thakkar"
                    className="relative w-full max-w-[260px] rounded-2xl object-cover shadow-lg"
                    style={{ aspectRatio: '4/5' }}
                    onError={(e) => {
                      e.target.src =
                        'https://ui-avatars.com/api/?name=Shlok+Thakkar&background=3730a3&color=fff&size=400';
                    }}
                  />
                </div>
              </div>

              <div className="lg:col-span-8 p-8 lg:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Shlok Thakkar</h3>
                <p className="text-primary-700 font-medium mt-1 flex items-center gap-2 flex-wrap">
                  <GraduationCap className="w-4 h-4" />
                  <span>Computer Engineering · LDRP-ITR / KSV University</span>
                  <span className="text-slate-400">·</span>
                  <span>Batch 2024-2028</span>
                </p>

                <div className="mt-5 space-y-4 text-slate-700 leading-relaxed text-[15px]">
                  <p>
                    Second-year engineering student. I spend most of my time on DSA and systems
                    fundamentals, and the rest on portfolio projects like this one. Long-term
                    goal is a software engineering role at a top company.
                  </p>
                  <p>
                    Auriva is my biggest project so far — built across ten-plus phases with a
                    20+ item verification checklist before each merge. The others span
                    healthcare (SwasthSathi), enterprise ERP (VendorBridge), and e-commerce
                    (SwiftCart), and collectively cover React, Node, Postgres, Prisma, Drizzle,
                    Clerk, multiple LLM providers, and PWA tooling.
                  </p>
                </div>

                <div className="mt-7 grid sm:grid-cols-2 gap-3">
                  {credentials.map((cred) => (
                    <div
                      key={cred.title}
                      className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg"
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-800 border border-slate-300 rounded-lg hover:border-primary-400 transition-colors text-sm font-medium"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a
                    href={mailto()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-800 border border-slate-300 rounded-lg hover:border-primary-400 transition-colors text-sm font-medium"
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

      {/* OTHER PROJECTS */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Other projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Auriva isn't the only thing in flight.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {otherProjects.map((project) => (
              <div
                key={project.name}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileCode2 className="w-5 h-5 text-primary-700" />
                  <h3 className="font-bold text-slate-900 text-lg">{project.name}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{project.tagline}</p>
                <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-mono">
                  {project.stack}
                </p>
              </div>
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

      {/* SCOPE — non-goals, neutrally framed, placed near the end */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Scope, honestly
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              And a few things Auriva doesn't try to be.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Every product has shape. These are the directions I deliberately didn't push in —
              either because someone else does them better, or because they wouldn't be honest
              to ship yet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {scopeBoundaries.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl"
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

      {/* CTA */}
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
        <div className="container-custom relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Try it. Read the code. Get in touch.
          </h2>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto text-lg">
            The fastest way to evaluate Auriva is to use it. The next fastest is to read the
            source.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/plan"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors shadow-lg"
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
  );
};

export default AboutPage;
