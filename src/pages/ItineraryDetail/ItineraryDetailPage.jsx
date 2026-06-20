import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { ArrowLeft, ChevronRight, Share2, Download, CheckSquare, List } from 'lucide-react'
import { getTrip, downloadTripPDF, patchTripDay, patchPackingChecklist } from '../../services/tripsService'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import PageHeader from '../../components/UI/PageHeader'
import Card from '../../components/UI/Card'
import TimelineDay from '../../components/UI/TimelineDay'
import WeatherForecastCard from '../../components/UI/WeatherForecastCard'
import EmptyState from '../../components/UI/EmptyState'
import SkeletonCard from '../../components/UI/SkeletonCard'
import RefinementPanel from '../../components/Refinement/RefinementPanel'
import ShareModal from '../../components/Sharing/ShareModal'
import usePageTitle from '../../hooks/usePageTitle'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency } from '../../utils/currency'
import { dayIndexForToday, formatTripDate } from '../../utils/dates'

const ItineraryDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { currency, usdToInr } = useCurrency()

  const dayRefs = useRef([])
  const todayScrolled = useRef(false)

  usePageTitle(trip?.destination ? `${trip.destination} Itinerary` : 'Itinerary')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getTrip(id, getToken)
      .then(setTrip)
      .catch((err) => setError(err.message || 'Failed to load itinerary'))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to today's day card once after trip loads
  useEffect(() => {
    if (!trip || todayScrolled.current) return
    const todayIndex = dayIndexForToday(trip.startDate)
    if (todayIndex >= 0 && todayIndex < (trip.days?.length ?? 0)) {
      todayScrolled.current = true
      setTimeout(() => {
        dayRefs.current[todayIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150) // small delay so layout is stable
    }
  }, [trip])

  const handleRefined = (updated) => {
    setTrip(prev => ({
      ...prev,
      overview: updated.overview ?? prev.overview,
      budgetBreakdown: updated.budget ?? prev.budgetBreakdown,
      hotels: updated.hotels ?? prev.hotels,
      packing: updated.packing ?? prev.packing,
      tips: updated.tips ?? prev.tips,
      days: (updated.days ?? []).map((day, idx) => ({
        ...day,
        id: prev.days?.[idx]?.id,
        dayNumber: idx + 1,
      })),
    }))
  }

  // Companion: optimistic update + background PATCH
  const handleActivityUpdate = useCallback(async (dayIndex, updatedDay) => {
    const prevTrip = trip
    setTrip(prev => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i === dayIndex ? { ...d, title: updatedDay.title, activities: updatedDay.activities } : d
      ),
    }))
    try {
      await patchTripDay(trip.id, dayIndex, updatedDay, getToken)
    } catch (err) {
      setTrip(prevTrip)
      toast.error("Couldn't save change. Try again?")
    }
  }, [trip, getToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // Packing checklist: save as interactive checklist
  const handleSaveChecklist = async () => {
    if (!trip?.packing?.length) return
    const checklist = trip.packing.map(item => ({ item, checked: false }))
    const prevTrip = trip
    setTrip(prev => ({ ...prev, packingChecklist: checklist }))
    try {
      await patchPackingChecklist(trip.id, checklist, getToken)
    } catch {
      setTrip(prevTrip)
      toast.error("Couldn't save checklist. Try again?")
    }
  }

  const handleChecklistToggle = async (itemIndex) => {
    if (!trip?.packingChecklist) return
    const prevTrip = trip
    const updated = trip.packingChecklist.map((item, i) =>
      i === itemIndex ? { ...item, checked: !item.checked } : item
    )
    setTrip(prev => ({ ...prev, packingChecklist: updated }))
    try {
      await patchPackingChecklist(trip.id, updated, getToken)
    } catch {
      setTrip(prevTrip)
      toast.error("Couldn't save checklist. Try again?")
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await downloadTripPDF(trip.id, getToken)
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShareChange = (newSlug) => {
    setTrip(prev => ({
      ...prev,
      shareSlug: newSlug,
      sharedAt: newSlug ? new Date().toISOString() : null,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20">
        <div className="container-custom py-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} showHeader lines={4} />)}
          </div>
          <div className="lg:col-span-4 space-y-4">
            {[1, 2].map(i => <SkeletonCard key={i} showHeader lines={3} />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20 flex items-center justify-center">
        <EmptyState
          title="Itinerary not found"
          description={error || 'This itinerary may have been removed.'}
          action={<Button variant="primary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
        />
      </div>
    )
  }

  const budgetTotal = trip.budgetBreakdown
    ? Object.values(trip.budgetBreakdown).reduce((a, b) => a + b, 0)
    : 0

  const todayDayIndex = dayIndexForToday(trip.startDate)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow="YOUR ITINERARY"
          title={trip.destination}
          description={`${trip.duration} days · ${trip.travelers} traveler${trip.travelers !== 1 ? 's' : ''} · ${trip.budget} budget`}
          actions={
            <div className="flex items-center gap-3">
              {trip.shareSlug && <Badge variant="accent">Shared</Badge>}
              <Button
                variant="hero"
                size="sm"
                icon={Download}
                onClick={handleDownloadPDF}
                loading={isDownloading}
              >
                PDF
              </Button>
              <Button
                variant="hero"
                icon={Share2}
                onClick={() => setShareModalOpen(true)}
              >
                Share
              </Button>
            </div>
          }
        />
      </div>

      <div className="container-custom py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-800 text-sm mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Day timeline */}
          <div className="lg:col-span-8 space-y-4">
            {trip.days?.map((day, index) => {
              const isToday = todayDayIndex === index
              return (
                <div key={day.id || index} ref={el => dayRefs.current[index] = el}>
                  <TimelineDay
                    day={day}
                    index={index}
                    defaultOpen={todayDayIndex >= 0 ? isToday : index === 0}
                    weather={trip.weather?.daily?.[index]}
                    companion={trip.startDate ? {
                      isToday,
                      tripDate: formatTripDate(trip.startDate, index),
                      onActivityUpdate: handleActivityUpdate,
                    } : undefined}
                  />
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <WeatherForecastCard daily={trip.weather?.daily} duration={trip.duration} destination={trip.destination} />

            {trip.budgetBreakdown && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(trip.budgetBreakdown).map(([key, value]) => {
                    const pct = budgetTotal > 0 ? Math.round((value / budgetTotal) * 100) : 0
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-slate-500">{key}</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(value, currency, usdToInr)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

            {trip.hotels?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Recommended Hotels</h3>
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

            {/* Packing — interactive checklist if saved, static list with Save button if not */}
            {(trip.packing?.length > 0 || trip.packingChecklist?.length > 0) && (
              <Card padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-800">Packing List</h3>
                  {!trip.packingChecklist && trip.packing?.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveChecklist}
                      className="flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 font-medium transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Save as checklist
                    </button>
                  )}
                  {trip.packingChecklist && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <List className="w-3.5 h-3.5" />
                      {trip.packingChecklist.filter(i => i.checked).length}/{trip.packingChecklist.length} packed
                    </span>
                  )}
                </div>

                {trip.packingChecklist ? (
                  <ul className="space-y-2">
                    {trip.packingChecklist.map((entry, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(idx)}
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                            ${entry.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}
                        >
                          {entry.checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                              <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm ${entry.checked ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                          {entry.item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    {trip.packing.map((item, idx) => (
                      <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent-500 rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {trip.tips?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Travel Tips</h3>
                <div className="bg-accent-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {trip.tips.map((tip, idx) => (
                      <li key={idx} className="text-slate-700 text-sm leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            <RefinementPanel tripId={trip.id} onRefined={handleRefined} />
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        tripId={trip.id}
        currentSlug={trip.shareSlug ?? null}
        onShareChange={handleShareChange}
        trip={trip}
      />
    </div>
  )
}

export default ItineraryDetailPage
