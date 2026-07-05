import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeTrip, cloneTrip } from '../../store/slices/tripSlice'
import {
  Compass, Plus, AlertCircle, Calendar, MapPin, Users,
  DollarSign, Sparkles, ArrowRight, Clock, CheckCircle2,
  TrendingUp, Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import Button from '../../components/UI/Button'
import EmptyState from '../../components/UI/EmptyState'
import TripCard from '../../components/Cards/TripCard'
import SkeletonCard from '../../components/UI/SkeletonCard'
import LocalStorageMigrationBanner from '../../components/Migration/LocalStorageMigrationBanner'
import destinationsDatabase from '../../constants/destinations'

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'inprogress',label: 'In progress' },
  { key: 'past',      label: 'Past' },
]

const DashboardPage = () => {
  usePageTitle('My Trips')
  const { savedTrips, tripsLoading, tripsError } = useSelector(state => state.trip)
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const handleDelete = (trip) => {
    if (!window.confirm(`Delete "${trip.destination || 'this trip'}"? This cannot be undone.`)) return
    dispatch(removeTrip(trip.id))
      .unwrap()
      .then(() => toast.success('Trip deleted.'))
      .catch((err) => toast.error(err || 'Failed to delete trip'))
  }

  const handleDuplicate = (tripId) => {
    dispatch(cloneTrip(tripId))
      .unwrap()
      .then(() => toast.success('Trip duplicated.'))
      .catch((err) => toast.error(err || 'Failed to duplicate trip'))
  }

  const handleView = (trip) => {
    navigate(`/itinerary/${trip.id}`)
  }

  const getDestImage = (trip) => {
    const match = destinationsDatabase.find(
      d => d.title.toLowerCase().includes((trip.destination || '').toLowerCase().split(',')[0])
    )
    return match?.image || null
  }

  const today = new Date().toISOString().slice(0, 10)

  // Real categorization
  const categorized = useMemo(() => {
    const upcoming = []
    const inProgress = []
    const past = []
    const noDate = []

    savedTrips.forEach(trip => {
      if (!trip.startDate) {
        noDate.push(trip)
        return
      }
      const start = new Date(trip.startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + ((trip.duration || 1) - 1))
      const todayDate = new Date(today)

      if (start > todayDate) upcoming.push(trip)
      else if (end >= todayDate) inProgress.push(trip)
      else past.push(trip)
    })

    // Sort upcoming by soonest first
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    // Sort past by most recent first
    past.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

    return { upcoming, inProgress, past, noDate, all: savedTrips }
  }, [savedTrips, today])

  // The "next" trip is the one to feature — in-progress takes priority, else soonest upcoming
  const featuredTrip = categorized.inProgress[0] || categorized.upcoming[0] || null
  const featuredIsToday = categorized.inProgress.length > 0

  const filteredTrips = useMemo(() => {
    let trips
    if (filter === 'upcoming') trips = categorized.upcoming
    else if (filter === 'inprogress') trips = categorized.inProgress
    else if (filter === 'past') trips = categorized.past
    else trips = categorized.all
    // Exclude the featured trip from the grid so it's not duplicated
    if (featuredTrip && filter === 'all') {
      return trips.filter(t => t.id !== featuredTrip.id)
    }
    return trips
  }, [categorized, filter, featuredTrip])

  const totalCost = savedTrips.reduce((sum, trip) => {
    if (!trip.budgetBreakdown || typeof trip.budgetBreakdown !== 'object') return sum
    return sum + Object.values(trip.budgetBreakdown).reduce((a, b) => a + b, 0)
  }, 0)

  const uniqueDestinations = new Set(savedTrips.map(t => t.destination).filter(Boolean)).size

  // Real stats — no more hardcoded 0
  const realStats = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      value: savedTrips.length.toString(),
      label: 'Total trips',
      tone: 'primary',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      value: categorized.upcoming.length.toString(),
      label: 'Upcoming',
      tone: 'amber',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      value: uniqueDestinations.toString(),
      label: 'Destinations',
      tone: 'emerald',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      value: totalCost > 0 ? `$${totalCost.toLocaleString()}` : '—',
      label: 'Total budgeted',
      tone: 'sky',
    },
  ]

  const toneStyles = {
    primary: 'from-primary-50 to-white border-primary-100 text-primary-700',
    amber: 'from-amber-50 to-white border-amber-200 text-amber-700',
    emerald: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
    sky: 'from-sky-50 to-white border-sky-200 text-sky-700',
  }

  const firstName = user?.firstName || user?.username || 'traveler'

  const daysUntilFeatured = () => {
    if (!featuredTrip?.startDate) return null
    const start = new Date(featuredTrip.startDate)
    const todayDate = new Date(today)
    const diff = Math.ceil((start - todayDate) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER — personal, asymmetric */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white pt-24 md:pt-28 pb-32 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
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

        <div className="container-custom relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 mb-3">
                Your travel dashboard
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-3 text-lg text-primary-100 max-w-2xl">
                {savedTrips.length === 0
                  ? "Your trips will appear here once you start planning."
                  : `${savedTrips.length} ${savedTrips.length === 1 ? 'trip' : 'trips'} saved · ${uniqueDestinations} ${uniqueDestinations === 1 ? 'destination' : 'destinations'} explored.`}
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              icon={Plus}
              onClick={() => navigate('/plan')}
            >
              Plan new trip
            </Button>
          </div>
        </div>
      </section>

      {/* STATS BAR — pulled up into the dark band */}
      <div className="container-custom -mt-20 relative z-10 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {realStats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${toneStyles[stat.tone]} border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              <div className={`w-9 h-9 bg-white border rounded-lg flex items-center justify-center mb-3 ${stat.tone === 'primary' ? 'border-primary-100' : stat.tone === 'amber' ? 'border-amber-200' : stat.tone === 'emerald' ? 'border-emerald-200' : 'border-sky-200'}`}>
                {stat.icon}
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom pb-16">
        <LocalStorageMigrationBanner />

        {tripsLoading ? (
          <div className="space-y-8">
            <div className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <SkeletonCard key={i} showHeader imageHeight="h-36" lines={3} />)}
            </div>
          </div>
        ) : tripsError ? (
          <EmptyState
            icon={AlertCircle}
            title="Failed to load trips"
            description={tripsError}
            action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>}
          />
        ) : savedTrips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 md:p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
              No trips yet — let's fix that.
            </h3>
            <p className="mt-3 text-slate-600 text-lg max-w-md mx-auto">
              Plan your first trip in under a minute. Pick a destination, share your style,
              and Auriva will write a day-by-day itinerary grounded in the real forecast.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                icon={Plus}
                onClick={() => navigate('/plan')}
              >
                Plan a trip
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={Compass}
                onClick={() => navigate('/discover')}
              >
                Browse destinations
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* FEATURED TRIP — large hero card */}
            {featuredTrip && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                    {featuredIsToday ? 'Trip in progress' : 'Up next'}
                  </p>
                  {featuredIsToday && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Live
                    </span>
                  )}
                </div>

                <div
                  onClick={() => handleView(featuredTrip)}
                  className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-primary-200 transition-all duration-300"
                >
                  <div className="md:grid md:grid-cols-12">
                    {/* Image side */}
                    <div className="md:col-span-5 h-56 md:h-auto relative overflow-hidden bg-slate-200">
                      {getDestImage(featuredTrip) ? (
                        <img
                          src={getDestImage(featuredTrip)}
                          alt={featuredTrip.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-white/0" />
                    </div>

                    {/* Content side */}
                    <div className="md:col-span-7 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight group-hover:text-primary-800 transition-colors">
                          {featuredTrip.destination || 'Untitled trip'}
                        </h2>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          {featuredTrip.startDate && (
                            <div className="inline-flex items-center gap-1.5 text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Date(featuredTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          {featuredTrip.duration && (
                            <div className="inline-flex items-center gap-1.5 text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {featuredTrip.duration} {featuredTrip.duration === 1 ? 'day' : 'days'}
                            </div>
                          )}
                          {featuredTrip.travelers && (
                            <div className="inline-flex items-center gap-1.5 text-slate-600">
                              <Users className="w-4 h-4 text-slate-400" />
                              {featuredTrip.travelers} {featuredTrip.travelers === 1 ? 'traveler' : 'travelers'}
                            </div>
                          )}
                        </div>

                        {!featuredIsToday && daysUntilFeatured() !== null && (
                          <div className="mt-5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            {daysUntilFeatured() === 0 ? 'Starts today' : daysUntilFeatured() === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilFeatured()} days`}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Button variant="primary" icon={ArrowRight} iconPosition="right">
                          {featuredIsToday ? 'Open today' : 'View itinerary'}
                        </Button>
                        <div className="text-xs text-slate-400 hidden sm:block">
                          Last edited {featuredTrip.updatedAt ? new Date(featuredTrip.updatedAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FILTER TABS — segmented control */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">All trips</h2>
                <span className="text-sm text-slate-400">{filteredTrips.length}</span>
              </div>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                {FILTER_TABS.map(tab => {
                  const count = tab.key === 'all' ? categorized.all.length : tab.key === 'upcoming' ? categorized.upcoming.length : tab.key === 'inprogress' ? categorized.inProgress.length : categorized.past.length
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filter === tab.key
                          ? 'bg-primary-700 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 text-xs ${filter === tab.key ? 'text-primary-200' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* TRIP GRID */}
            {filteredTrips.length === 0 ? (
              <EmptyState
                icon={Compass}
                title={`No ${filter === 'all' ? '' : filter + ' '}trips`}
                description={
                  filter === 'upcoming' ? "Plan a trip with a future start date to see it here." :
                  filter === 'inprogress' ? "No trips happening today." :
                  filter === 'past' ? "Your completed adventures will appear here." :
                  "Plan your first trip to get started."
                }
                action={<Button variant="outline" onClick={() => setFilter('all')}>Show all trips</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    image={getDestImage(trip)}
                    onView={() => handleView(trip)}
                    onDelete={() => handleDelete(trip)}
                    onDuplicate={() => handleDuplicate(trip.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
