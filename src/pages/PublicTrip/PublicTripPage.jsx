import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Download } from 'lucide-react'
import { fetchPublicTrip, downloadPublicTripPDF } from '../../services/tripsService'
import toast from 'react-hot-toast'
import PageHeader from '../../components/UI/PageHeader'
import Card from '../../components/UI/Card'
import TimelineDay from '../../components/UI/TimelineDay'
import EmptyState from '../../components/UI/EmptyState'
import SkeletonCard from '../../components/UI/SkeletonCard'
import GradientCTA from '../../components/UI/GradientCTA'
import Button from '../../components/UI/Button'
import usePageTitle from '../../hooks/usePageTitle'

// Updates a meta tag by property or name, creating it if absent
function setMetaTag(attrKey, attrValue, content) {
  const selector = `meta[${attrKey}="${attrValue}"]`
  let tag = document.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attrKey, attrValue)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const PublicTripPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  usePageTitle(trip?.destination ? `${trip.destination} trip` : 'Shared trip')

  useEffect(() => {
    if (!slug) return
    fetchPublicTrip(slug)
      .then(setTrip)
      .catch((err) => setError(err.message || 'Trip not found'))
      .finally(() => setLoading(false))
  }, [slug])

  // Dynamic OG tag updates — works for in-app browsers that execute JS before reading meta tags
  useEffect(() => {
    if (!trip) return

    const description = trip.overview?.slice(0, 200)
      || `An AI-generated travel itinerary for ${trip.destination}.`

    setMetaTag('property', 'og:title', `${trip.duration} days in ${trip.destination} — Auriva`)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', window.location.href)
    setMetaTag('name',     'twitter:title', `${trip.duration} days in ${trip.destination}`)
    setMetaTag('name',     'twitter:description', trip.overview?.slice(0, 200) || 'Personalized travel itinerary by Auriva.')

    // Restore defaults when navigating away
    return () => {
      setMetaTag('property', 'og:title', 'Auriva — AI Travel Strategist')
      setMetaTag('property', 'og:description', 'Personalized AI-generated travel itineraries in seconds. Real places, real recommendations, real prices.')
      setMetaTag('property', 'og:url', 'https://auriva.app')
      setMetaTag('name',     'twitter:title', 'Auriva — AI Travel Strategist')
      setMetaTag('name',     'twitter:description', 'Personalized AI-generated travel itineraries in seconds.')
    }
  }, [trip])

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await downloadPublicTripPDF(slug)
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
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
          title="Trip not found"
          description={error || "This trip doesn't exist or has been unshared."}
          action={<Button variant="primary" onClick={() => navigate('/')}>Go to Auriva home</Button>}
        />
      </div>
    )
  }

  const budgetTotal = trip.budgetBreakdown
    ? Object.values(trip.budgetBreakdown).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow="SHARED ITINERARY"
          title={trip.destination}
          description={`${trip.duration} days · ${trip.travelers} traveler${trip.travelers !== 1 ? 's' : ''} · ${trip.budget} budget`}
          actions={
            <Button
              variant="hero"
              size="sm"
              icon={Download}
              onClick={handleDownloadPDF}
              loading={isDownloading}
            >
              Download PDF
            </Button>
          }
        />
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Day timeline */}
          <div className="lg:col-span-8 space-y-4">
            {trip.days?.map((day, index) => (
              <TimelineDay key={index} day={day} index={index} defaultOpen={index === 0} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 lg:self-start">
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
                          <span className="font-semibold text-slate-800">${value}</span>
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

            {trip.packing?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Packing List</h3>
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
          </div>
        </div>
      </div>

      {/* Upsell CTA — turns public views into signups */}
      <GradientCTA
        title="Want to plan your own trip?"
        description="Auriva crafts personalized day-by-day itineraries with AI in seconds."
        primaryAction={{ label: 'Try Auriva free', to: '/' }}
      />
    </div>
  )
}

export default PublicTripPage
