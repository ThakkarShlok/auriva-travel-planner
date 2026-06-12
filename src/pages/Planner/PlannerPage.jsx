import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  generateItineraryStreaming,
  saveTrip,
  clearCurrentTrip,
  clearError,
  streamAborted,
} from '../../store/slices/tripSlice'
import { AlertCircle, Download, RefreshCw, ArrowLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import PageHeader from '../../components/UI/PageHeader'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import TimelineDay from '../../components/UI/TimelineDay'
import SkeletonCard from '../../components/UI/SkeletonCard'
import EmptyState from '../../components/UI/EmptyState'
import RefinementPanel from '../../components/Refinement/RefinementPanel'

// ─── Trip context card ────────────────────────────────────────────────────────

const ContextCard = ({ data }) => (
  <Card padding="md" className="mb-6">
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
      {data.destination && <span><span className="font-medium text-slate-700">{data.destination}</span></span>}
      {data.duration && <span>{data.duration} days</span>}
      {data.travelers && <span>{data.travelers} traveler{data.travelers !== 1 ? 's' : ''}</span>}
      {data.budget && <span className="capitalize">{data.budget} budget</span>}
      {data.interests && <span className="truncate max-w-xs">{data.interests}</span>}
    </div>
  </Card>
)

// ─── Sidebar content ──────────────────────────────────────────────────────────

const SidebarCards = ({ trip }) => {
  if (!trip) {
    return (
      <>
        <SkeletonCard showHeader lines={4} />
        <SkeletonCard showHeader lines={3} />
        <SkeletonCard showHeader lines={3} />
      </>
    )
  }

  const budgetTotal = trip.budget
    ? Object.values(trip.budget).reduce((a, b) => a + b, 0)
    : 0

  return (
    <>
      {trip.budget && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Budget Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(trip.budget).map(([key, value]) => {
              const pct = budgetTotal > 0 ? Math.round((value / budgetTotal) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-slate-500">{key}</span>
                    <span className="font-semibold text-slate-700">${value}</span>
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

      {trip.tips?.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Travel Tips</h3>
          <div className="bg-accent-50 rounded-xl p-4">
            <ul className="space-y-2">
              {trip.tips.map((tip, idx) => (
                <li key={idx} className="text-slate-700 text-sm leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
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

  const {
    onboardingData,
    currentTrip,
    loading,
    error,
    streamingProgress,
    streamingTokenCount,
  } = useSelector(state => state.trip)

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
      // Synchronously reset loading state so StrictMode's second mount sees clean
      // state and can restart. Reset the ref so the second mount isn't blocked.
      dispatch(streamAborted())
      hasGenerated.current = false
      promise.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveTrip = () => {
    if (!currentTrip) return
    dispatch(saveTrip({
      ...currentTrip,
      destination: onboardingData.destination,
      duration: onboardingData.duration,
      travelers: onboardingData.travelers,
      budget: onboardingData.budget,
    }))
    toast.success('Trip saved to your dashboard!')
  }

  const handleRegenerate = () => {
    dispatch(clearError())
    hasGenerated.current = true
    dispatch(generateItineraryStreaming(onboardingData))
  }

  const handlePlanAnother = () => {
    dispatch(clearCurrentTrip())
    navigate('/plan')
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
            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                Technical details
              </summary>
              <pre className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg overflow-auto max-h-28 whitespace-pre-wrap">
                {error}
              </pre>
            </details>
          </Card>
        </div>
      </div>
    )
  }

  // During streaming AND after completion, the hero is always visible
  const partialDays = loading ? (streamingProgress?.days || []) : (currentTrip?.days || [])
  const expectedDays = onboardingData.duration || 5
  const skeletonCount = loading ? Math.max(1, expectedDays - partialDays.length) : 0

  // ── Nothing yet (before streamStarted fires) ────────────────────────────────
  if (!loading && !currentTrip) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow={loading ? 'GENERATING' : 'YOUR ITINERARY'}
          title={`${onboardingData.duration} days in ${onboardingData.destination}`}
          description={
            loading
              ? 'Building your personalized itinerary...'
              : `${onboardingData.duration} days · ${onboardingData.travelers} travelers · ${onboardingData.budget} budget`
          }
          actions={
            !loading && (
              <>
                <Button variant="accent" icon={Download} onClick={handleSaveTrip}>
                  Save trip
                </Button>
                <Button variant="hero" icon={RefreshCw} onClick={handleRegenerate}>
                  Regenerate
                </Button>
              </>
            )
          }
        />
      </div>

      <div className="container-custom py-10">
        {/* Streaming status ticker */}
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

        {/* Context summary — shown only after completion */}
        {!loading && <ContextCard data={onboardingData} />}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Day timeline */}
          <div className="lg:col-span-8 space-y-4">
            {partialDays.map((day, i) => (
              <TimelineDay key={i} day={day} index={i} defaultOpen={i === 0} />
            ))}
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} showHeader lines={3 + (i % 2)} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SidebarCards trip={loading ? streamingProgress : currentTrip} />
            {/* Refinement panel — appears after generation completes */}
            {!loading && currentTrip && <RefinementPanel />}
          </div>
        </div>

        {/* Bottom CTA — shown only after completion */}
        {!loading && currentTrip && (
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" icon={Download} onClick={handleSaveTrip}>
              Save to dashboard
            </Button>
            <Button variant="outline" icon={ArrowLeft} onClick={handlePlanAnother}>
              Plan another trip
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlannerPage
