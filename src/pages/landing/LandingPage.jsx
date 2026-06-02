import { Link } from 'react-router-dom'
import TopNav from '../../components/layout/TopNav.jsx'
import Footer from '../../components/layout/Footer.jsx'
import DestinationCard from '../../components/cards/DestinationCard.jsx'
import trendingDestinations from '../../constants/destinations.js'
import Button from '../../components/ui/Button.jsx'
import usePageTitle from '../../hooks/usePageTitle.js'

function LandingPage() {
  usePageTitle('Travel planner')

  return (
    <div className="min-h-screen bg-surf text-ink-900">
      <TopNav />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-16 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accentSoft bg-accentSoft px-4 py-2 text-sm font-semibold text-ink-900">
              AI travel planning tailored to your dream trip
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Build customized itineraries for every trip with AI-guided planning.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Travello AI helps travelers generate balanced daily schedules, local dining recommendations,
                hotel suggestions, transportation plans, and packing advice — all in one polished product.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/plan">
                <Button className="w-full sm:w-auto">Create itinerary</Button>
              </Link>
              <a href="#discover" className="w-full sm:w-auto">
                <Button variant="secondary">Explore destinations</Button>
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-xl">
                <p className="text-3xl font-semibold text-ink-900">28+</p>
                <p className="mt-3 text-sm text-slate-600">destination themes supported</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-xl">
                <p className="text-3xl font-semibold text-ink-900">100%</p>
                <p className="mt-3 text-sm text-slate-600">dynamic itineraries generated in seconds</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-xl">
                <p className="text-3xl font-semibold text-ink-900">Saved</p>
                <p className="mt-3 text-sm text-slate-600">navigation-ready trips for repeat planning</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-secondary-500 to-accent-700 p-8 text-white shadow-md">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.15), transparent 24%)' }} />
            <div className="relative space-y-6">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.36em] text-slate-200">AI-powered trip concept</p>
                <h2 className="text-3xl font-semibold leading-tight">From concept to complete schedule.</h2>
                <p className="text-sm leading-7 text-slate-200/90">
                  Create personalized travel plans that balance local experiences, logistics, and budget — with confidence and clarity.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <p className="text-sm text-slate-200">Day 1 · City highlights</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-100">
                  <li>• Morning: curated urban walking route</li>
                  <li>• Afternoon: local market lunch + museum</li>
                  <li>• Evening: riverside dinner and nighttime city view</li>
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em]">Packing</p>
                  <p className="mt-3 text-sm">Travel smart with weather-based essentials.</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em]">Local food</p>
                  <p className="mt-3 text-sm">Recommended eateries inside your comfort budget.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="mt-20 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Trending destinations</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900">Discover curated travel ideas.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Explore premium destinations supported by bespoke itinerary suggestions and local comforts.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {trendingDestinations.map((destination) => (
              <DestinationCard key={destination.id} {...destination} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
