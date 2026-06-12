import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Button from '../../components/UI/Button'
import PageHeader from '../../components/UI/PageHeader'
import Card from '../../components/UI/Card'
import TimelineDay from '../../components/UI/TimelineDay'
import EmptyState from '../../components/UI/EmptyState'
import usePageTitle from '../../hooks/usePageTitle'

const ItineraryDetailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { trip } = location.state || {}

  usePageTitle(trip?.destination ? `${trip.destination} Itinerary` : 'Itinerary')

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20 flex items-center justify-center">
        <EmptyState
          title="Itinerary not found"
          description="This itinerary may have been removed."
          action={<Button variant="primary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
        />
      </div>
    )
  }

  const itineraryData = trip.details || trip
  const budgetTotal = itineraryData.budget
    ? Object.values(itineraryData.budget).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow="YOUR ITINERARY"
          title={`${trip.preferences?.destination || trip.destination}`}
          description={`${trip.preferences?.duration || trip.duration} days · ${trip.preferences?.travelers || trip.travelers} travelers · ${trip.preferences?.budget || trip.budget} budget`}
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
            {itineraryData.days?.map((day, index) => (
              <TimelineDay key={index} day={day} index={index} defaultOpen={index === 0} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 lg:self-start">
            {itineraryData.budget && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(itineraryData.budget).map(([key, value]) => {
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

            {itineraryData.hotels?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Recommended Hotels</h3>
                <ul className="space-y-2">
                  {itineraryData.hotels.map((hotel, idx) => (
                    <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary-500 flex-shrink-0" />
                      {hotel}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {itineraryData.packing?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Packing List</h3>
                <ul className="space-y-2">
                  {itineraryData.packing.map((item, idx) => (
                    <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent-500 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {itineraryData.tips?.length > 0 && (
              <Card padding="md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Travel Tips</h3>
                <div className="bg-accent-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {itineraryData.tips.map((tip, idx) => (
                      <li key={idx} className="text-slate-700 text-sm leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItineraryDetailPage
