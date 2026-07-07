import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  generateItineraryStreaming,
  persistTrip,
  clearCurrentTrip,
  clearError,
  streamAborted,
} from '../../store/slices/tripSlice'
import { AlertCircle, RefreshCw, ArrowLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import TimelineDay from '../../components/ui/TimelineDay'
import SkeletonCard from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import WeatherForecastCard from '../../components/ui/WeatherForecastCard'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency } from '../../utils/currency'

// ─── Sidebar cards (streaming preview + final) ────────────────────────────────

const SidebarCards = ({ trip, weatherDaily, duration, destination }) => {
  const { currency, usdToInr } = useCurrency()
  if (!trip) {
    return (
      <>
        <SkeletonCard showHeader lines={4} />
        <SkeletonCard showHeader lines={3} />
        <SkeletonCard showHeader lines={3} />
      </>
    )
  }

  const budgetData = trip.budgetBreakdown || trip.budget
  const budgetTotal = budgetData && typeof budgetData === 'object'
    ? Object.values(budgetData).reduce((a, b) => a + b, 0)
    : 0

  return (
    <>
      <WeatherForecastCard daily={weatherDaily} duration={duration} destination={destination} />

      {budgetData && typeof budgetData === 'object' && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Budget Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(budgetData).map(([key, value]) => {
              const pct = budgetTotal > 0 ? Math.round((value / budgetTotal) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-slate-500">{key}</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(value, currency, usdToInr)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {trip.hotels?.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Recommended Hotels</h3>
          <ul className="space-y-2">
            {trip.hotels.map((hotel, idx) => (
              <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-primary-500 flex-shrink-0" />
                {hotel}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {trip.packing?.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Packing List</h3>
          <ul className="space-y-2">
            {trip.packing.map((item, idx) => (
              <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent-500 rounded-full flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}

// ─── PlannerPage ──────────────────────────────────────────────────────────────

const PlannerPage = () => {
  usePageTitle('Planner')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hasGenerated = useRef(false)
  const persistingRef = useRef(false)

  const {
    onboardingData,
    currentTrip,
    loading,
    error,
    streamingProgress,
    streamingTokenCount,
    streamingWeather,
  } = useSelector(state => state.trip)

  const weatherDaily = (loading ? streamingWeather : currentTrip?.weather)?.daily

  // Kick off streaming generation on mount
  useEffect(() => {
    if (!onboardingData.destination) {
      navigate('/plan', { replace: true })
      return
    }
    if (currentTrip || loading || error || hasGenerated.current) return
    hasGenerated.current = true

    const promise = dispatch(generateItineraryStreaming(onboardingData))
    return () => {
      dispatch(streamAborted())
      hasGenerated.current = false
      promise.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // After streaming completes, persist to Neon then navigate to the persistent URL
  useEffect(() => {
    if (!currentTrip || loading || persistingRef.current) return
    persistingRef.current = true

    dispatch(persistTrip({
      preferences: {
        destination: onboardingData.destination,
        duration: onboardingData.duration,
        travelers: onboardingData.travelers,
        budget: onboardingData.budget,
        interests: onboardingData.interests || null,
        startDate: onboardingData.startDate || null,
      },
      generated: currentTrip,
    }))
      .unwrap()
      .then((saved) => {
        dispatch(clearCurrentTrip())
        navigate(`/itinerary/${saved.id}`, { replace: true })
      })
      .catch((err) => {
        console.error('[PlannerPage] persist failed:', err)
        toast.error('Could not save trip — check your connection.')
        persistingRef.current = false
      })
  }, [currentTrip, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = () => {
    dispatch(clearError())
    hasGenerated.current = true
    persistingRef.current = false
    dispatch(generateItineraryStreaming(onboardingData))
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <Card padding="lg">
            <EmptyState
              icon={AlertCircle}
              title="Something went wrong"
              description={error}
              action={
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" onClick={handleRegenerate}>Try again</Button>
                  <Button variant="outline" onClick={() => navigate('/plan')}>Start over</Button>
                </div>
              }
            />
          </Card>
        </div>
      </div>
    )
  }

  const partialDays = loading ? (streamingProgress?.days || []) : (currentTrip?.days || [])
  const expectedDays = onboardingData.duration || 5
  const skeletonCount = loading ? Math.max(1, expectedDays - partialDays.length) : 0

  if (!loading && !currentTrip) return null

  const isSaving = !loading && !!currentTrip

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow={loading ? 'GENERATING' : 'SAVING…'}
          title={`${onboardingData.duration} days in ${onboardingData.destination}`}
          description={
            loading
              ? 'Building your personalized itinerary...'
              : 'Saving your trip to your account…'
          }
          actions={
            isSaving && (
              <Button variant="hero" icon={RefreshCw} onClick={handleRegenerate}>
                Regenerate instead
              </Button>
            )
          }
        />
      </div>

      <div className="container-custom py-10">
        {loading && (
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-sm text-slate-500">
              {streamingTokenCount > 0
                ? `Generating... ${streamingTokenCount.toLocaleString()} tokens`
                : 'Starting generation...'}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {partialDays.map((day, i) => (
              <TimelineDay key={i} day={day} index={i} defaultOpen={i === 0} weather={weatherDaily?.[i]} />
            ))}
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} showHeader lines={3 + (i % 2)} />
            ))}
          </div>

          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SidebarCards
              trip={loading ? streamingProgress : currentTrip}
              weatherDaily={weatherDaily}
              duration={onboardingData.duration}
              destination={onboardingData.destination}
            />
          </div>
        </div>

        {isSaving && (
          <div className="mt-12 pt-8 border-t border-slate-200 flex justify-center">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/plan')}>
              Plan another trip
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlannerPage
