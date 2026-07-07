import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateOnboarding } from '../../store/slices/tripSlice'
import usePageTitle from '../../hooks/usePageTitle'
import {
  Sparkles, ArrowRight, CloudRain, Cloud, Sun,
  CheckCircle2, Circle, TrendingUp, Wifi, WifiOff,
  Database, Github, Zap, FileText, MessageSquare,
  MapPin, Calendar, BarChart3, Code2
} from 'lucide-react'
import destinationsDatabase from '../../constants/destinations'
import Button from '../../components/ui/Button'
import Section from '../../components/ui/Section'
import GradientCTA from '../../components/ui/GradientCTA'
import DestinationCard from '../../components/cards/DestinationCard'

const HomePage = () => {
  usePageTitle(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  const featuredDestinations = destinationsDatabase.slice(0, 6)

  // Streaming demo lines for the bento panel
  const streamLines = [
    'Generating itinerary for Tokyo...',
    'Forecast: Day 3 — light rain expected',
    'Swapping Day 3 to indoor activities',
    'Pulling FX rate · USD → INR cached',
    'Day 1 · Asakusa · Senso-ji Temple',
    'Day 2 · Shibuya · Harajuku · Meiji',
    'Day 3 · TeamLab · Roppongi Hills',
    '✓ Itinerary ready · 7.4s',
  ]
  const [streamCount, setStreamCount] = useState(1)
  useEffect(() => {
    const id = setInterval(() => {
      setStreamCount((c) => (c >= streamLines.length ? 1 : c + 1))
    }, 900)
    return () => clearInterval(id)
  }, [streamLines.length])

  const handlePersonalize = (destination) => {
    dispatch(updateOnboarding({
      destination: destination.title,
      duration: parseInt(destination.duration.split('-')[0]) || 5,
      budget: destination.budget,
      interests: Array.isArray(destination.interests) ? destination.interests.join(', ') : destination.interests,
      travelers: 2,
    }))
    navigate(
      isAuthenticated ? '/planner' : '/login',
      isAuthenticated ? undefined : { state: { from: { pathname: '/planner' } } }
    )
  }

  const honestStats = [
    { value: `${destinationsDatabase.length}`, label: 'Curated destinations', sub: 'Hand-picked, browsable' },
    { value: '~8s', label: 'Median generation', sub: 'Streaming via Groq' },
    { value: '14-day', label: 'Weather lookahead', sub: 'Cached server-side' },
    { value: '0', label: 'Subscription tiers', sub: 'Free, today and later' },
  ]

  const capabilities = [
    {
      icon: <Cloud className="w-5 h-5" />,
      title: 'Grounded in real weather',
      description:
        "Before generation starts, Auriva fetches your destination's 14-day forecast and passes it to the model as context. Rain on day three? Indoor swaps surface automatically — not because the model guessed, because the data was in the prompt.",
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: 'Designed for during the trip',
      description:
        "Most travel tools end at 'here's your itinerary, good luck.' Auriva keeps going — check off activities as you do them, log what you actually spent, take notes. Everything saves locally and syncs the moment you have signal.",
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Structured memory, not chat history',
      description:
        "Every trip is a typed Postgres row, not a fuzzy conversation log. After two completed trips, Auriva extracts your patterns — pace, budget tendency, top categories — and uses them as input next time. Override anything it infers.",
    },
  ]

  const techStack = [
    { name: 'React 18', category: 'Frontend' },
    { name: 'Vite', category: 'Build' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Redux Toolkit', category: 'State' },
    { name: 'Groq + Llama 3.3', category: 'AI' },
    { name: 'Neon Postgres', category: 'Database' },
    { name: 'Drizzle ORM', category: 'ORM' },
    { name: 'Clerk', category: 'Auth' },
    { name: 'Vercel', category: 'Hosting' },
    { name: 'Open-Meteo', category: 'Weather' },
    { name: 'EmailJS', category: 'Email' },
    { name: 'Service Workers', category: 'PWA' },
  ]

  return (
    <div className="bg-white">
      {/* ============================================================ */}
      {/* HERO — bento-grid layout                                       */}
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
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl"
        />

        <div className="container-custom relative py-16 md:py-20">
          {/* Top — headline */}
          <div className="max-w-4xl mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Free · Open source · Built solo
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              A travel planner you can actually use{' '}
              <span className="text-amber-300">during the trip.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary-100 max-w-3xl leading-relaxed">
              Auriva writes day-by-day itineraries grounded in the real forecast for your
              destination — and stays useful after you land. Check off activities, log what you
              spent, work offline. The next trip is sharper than the last.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/plan')}
              >
                Plan a trip
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border border-white/30 hover:bg-white/10 hover:text-white"
                onClick={() => navigate('/discover')}
              >
                Browse destinations
              </Button>
            </div>
          </div>

          {/* Bento grid — six tiles, varied sizes */}
          <div className="grid grid-cols-6 md:grid-cols-12 gap-3 md:gap-4">
            {/* TILE 1 — Streaming demo, span 6 */}
            <div className="col-span-6 md:col-span-6 row-span-2 bg-slate-900/85 backdrop-blur rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <span className="ml-2 text-[11px] text-slate-400 font-mono">
                  auriva · live response
                </span>
              </div>
              <div className="px-5 py-5 font-mono text-[12px] md:text-[13px] min-h-[260px] space-y-2">
                {streamLines.slice(0, streamCount).map((line, idx) => (
                  <div
                    key={`${streamCount}-${idx}`}
                    className={`flex items-start gap-2 ${
                      line.startsWith('✓') ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                    style={{
                      animation: idx === streamCount - 1 ? 'streamLineIn 400ms ease-out' : 'none',
                    }}
                  >
                    {line.startsWith('✓') ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <span className="text-amber-400 flex-shrink-0">›</span>
                    )}
                    <span>{line}</span>
                  </div>
                ))}
                {streamCount < streamLines.length && (
                  <span className="inline-block w-2 h-4 bg-amber-400 align-middle animate-pulse" />
                )}
              </div>
            </div>

            {/* TILE 2 — Weather chip */}
            <div className="col-span-3 md:col-span-3 bg-white/95 backdrop-blur rounded-2xl border border-white/20 p-5 flex flex-col justify-between min-h-[125px]">
              <div className="flex items-center gap-2 text-sky-700">
                <CloudRain className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Day 3</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">60%</p>
                <p className="text-xs text-slate-500 mt-0.5">Rain expected · Tokyo</p>
              </div>
            </div>

            {/* TILE 3 — Under budget */}
            <div className="col-span-3 md:col-span-3 bg-white/95 backdrop-blur rounded-2xl border border-white/20 p-5 flex flex-col justify-between min-h-[125px]">
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Day total</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">−$4</p>
                <p className="text-xs text-slate-500 mt-0.5">Under estimate</p>
              </div>
            </div>

            {/* TILE 4 — Offline badge */}
            <div className="col-span-3 md:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between min-h-[125px] text-white">
              <div className="flex items-center gap-2 text-amber-300">
                <WifiOff className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Offline</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Open on the plane</p>
                <p className="text-xs text-slate-400 mt-0.5">Service worker cached</p>
              </div>
            </div>

            {/* TILE 5 — Profile insight */}
            <div className="col-span-3 md:col-span-3 bg-white/95 backdrop-blur rounded-2xl border border-white/20 p-5 flex flex-col justify-between min-h-[125px]">
              <div className="flex items-center gap-2 text-primary-700">
                <BarChart3 className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Profile</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Cultural · Mid-budget</p>
                <p className="text-xs text-slate-500 mt-0.5">From 4 completed trips</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes streamLineIn {
            from { opacity: 0; transform: translateX(-4px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </section>

      {/* ============================================================ */}
      {/* CAPABILITIES                                                  */}
      {/* ============================================================ */}
      <Section bg="white">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
            What makes this different
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Three capabilities, working together.
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Any LLM can write you an itinerary. The harder problem is grounding the output in
            real data, keeping it useful after generation, and learning from what actually
            happened.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {capabilities.map((cap, idx) => (
            <div
              key={cap.title}
              className="group relative bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 text-[60px] font-bold text-slate-100 leading-none select-none group-hover:text-primary-50 transition-colors">
                0{idx + 1}
              </div>
              <div className="relative">
                <div className="w-11 h-11 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center mb-5 border border-primary-100">
                  {cap.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{cap.title}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/* BEFORE / AFTER                                                */}
      {/* ============================================================ */}
      <Section bg="slate">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
            Why grounding matters
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Same prompt. Different output.
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            "Plan three days in Tokyo." Without grounding, you get a plausible itinerary.
            With weather and your past trips in the prompt, day three changes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Without grounding</span>
              <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-400">
                Generic AI
              </span>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                Day 3 · Tokyo
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">9:30</span>
                <span className="text-slate-700">Walk through Yoyogi Park</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">12:00</span>
                <span className="text-slate-700">Lunch at a local izakaya</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">14:00</span>
                <span className="text-slate-700">Walking tour of Shibuya</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">17:00</span>
                <span className="text-slate-700">Sunset at Shibuya Sky observation deck</span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 italic">
                  Plausible. But you'll spend the day in the rain — the model didn't see the
                  forecast.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-primary-300 overflow-hidden relative shadow-lg">
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
              <Sparkles className="w-3 h-3" />
              Auriva
            </div>
            <div className="px-6 py-4 bg-primary-50 border-b border-primary-100 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary-700" />
              <span className="text-sm font-semibold text-primary-900">With grounding</span>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-2">
                <span>Day 3 · Tokyo</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-50 border border-sky-200 rounded text-sky-700 normal-case tracking-normal">
                  <CloudRain className="w-3 h-3" /> Rain · 60%
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">9:30</span>
                <span className="text-slate-700">
                  <strong className="font-semibold">TeamLab Planets</strong> — indoor immersive art,
                  rainy-day swap
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">12:30</span>
                <span className="text-slate-700">
                  <strong className="font-semibold">Ichiran Ramen Shibuya</strong> — solo booths,
                  no queue in the rain
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">14:30</span>
                <span className="text-slate-700">
                  <strong className="font-semibold">Tokyo National Museum</strong> — matches your
                  past Cultural picks
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs flex-shrink-0 w-12">18:00</span>
                <span className="text-slate-700">
                  <strong className="font-semibold">Roppongi Hills Sky Deck</strong> — forecast
                  clears by 6 PM
                </span>
              </div>
              <div className="pt-4 mt-4 border-t border-primary-100">
                <p className="text-xs text-primary-800 italic">
                  Same destination, same prompt — but the model saw the rain and your category
                  history before writing day three.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* COMPANION MODE PREVIEW                                        */}
      {/* ============================================================ */}
      <Section bg="white">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
              Companion mode
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              The trip continues after generation.
            </h2>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed">
              Open your itinerary on the plane. Check things off as you go. Note that the
              museum cost more than expected. None of it needs signal.
            </p>

            <ul className="mt-7 space-y-3 text-slate-700">
              {[
                'Weather on every day card · refreshed live on today',
                'Actual-cost tracking with INR/USD toggle',
                'Service-worker backed · open trips work offline',
                "'You're near this' badge with permission",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 inline-flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      Day 3 · Today
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">Tokyo · Thursday</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-sm">
                    <CloudRain className="w-4 h-4" />
                    <span className="font-medium">Light rain · 60%</span>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-semibold text-slate-900 line-through opacity-60">
                          TeamLab Planets
                        </h4>
                        <span className="text-xs text-slate-500 flex-shrink-0">9:30 AM</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-through opacity-60">
                        Indoor immersive art — rainy-day swap
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500">Est. $32</span>
                        <span className="text-emerald-700 font-medium">
                          Actual $28 · saved $4
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-amber-200 bg-amber-50/40">
                    <Circle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">Lunch · Ichiran Ramen</h4>
                        <span className="text-xs text-slate-500 flex-shrink-0">12:30 PM</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Tonkotsu specialist · solo booths
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500">Est. $12</span>
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <MapPin className="w-3 h-3" /> You're near this · 0.4 km
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Circle className="w-6 h-6 text-slate-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">Roppongi Hills Sky Deck</h4>
                        <span className="text-xs text-slate-500 flex-shrink-0">5:00 PM</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Forecast clears after the rain
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500">Est. $18</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Day total · estimated</span>
                  <span className="font-semibold text-slate-900">$62 · ₹5,170</span>
                </div>
              </div>

              <div className="absolute -bottom-4 left-6 inline-flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
                <WifiOff className="w-3.5 h-3.5" />
                Available offline
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* DESTINATIONS                                                  */}
      {/* ============================================================ */}
      <Section bg="slate">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
            Pick a destination
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Or start from your own idea.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              {...dest}
              onClick={() => handlePersonalize(dest)}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/discover')}
          >
            See all {destinationsDatabase.length} destinations
          </Button>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* HONEST STATS — dark band                                      */}
      {/* ============================================================ */}
      <section className="bg-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        />
        <div className="container-custom relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {honestStats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="text-4xl md:text-5xl font-bold text-amber-400">{stat.value}</div>
                <div className="mt-2 text-white font-medium">{stat.label}</div>
                <div className="text-sm text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TECH STACK                                                    */}
      {/* ============================================================ */}
      <Section bg="white">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
            Under the hood
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Built on tools that hold up in production.
          </h2>
          <p className="mt-3 text-slate-600">
            Every choice — and its tradeoffs — is documented in the README.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-xs font-mono text-slate-400">{tech.category}</span>
              <span className="text-sm font-semibold text-slate-900">{tech.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="https://github.com/ThakkarShlok"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-primary-700 transition-colors font-medium"
          >
            <Github className="w-5 h-5" />
            Read the source on GitHub
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* HOW IT WORKS                                                  */}
      {/* ============================================================ */}
      <Section bg="slate">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Three steps to a trip.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              n: '01',
              title: 'Tell us where',
              description:
                "Pick from the catalog or type your own. Auriva geocodes it and starts pulling the live forecast.",
              icon: <FileText className="w-5 h-5" />,
            },
            {
              n: '02',
              title: 'Share your style',
              description:
                "Budget, pace, interests, travelers, start date. Fields pre-fill from past trips if you have them.",
              icon: <Sparkles className="w-5 h-5" />,
            },
            {
              n: '03',
              title: 'Get your trip',
              description:
                "A streaming day-by-day plan with real places, real prices, and weather-aware swaps.",
              icon: <Zap className="w-5 h-5" />,
            },
          ].map((step) => (
            <div key={step.n} className="group">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-6xl font-bold text-primary-200 leading-none group-hover:text-primary-300 transition-colors">{step.n}</span>
                <span className="text-primary-700">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <GradientCTA
        title="Plan something memorable."
        description="Free to try, no sign-up to start. Save trips once you're in."
        primaryAction={{ label: 'Plan a trip', to: '/plan' }}
        secondaryAction={{ label: 'How it was built', to: '/about' }}
      />
    </div>
  )
}

export default HomePage
