import React, { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, Umbrella } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency } from '../../utils/currency'
import { weatherIconFor, weatherTextFor } from '../../utils/weather'
import TodayBadge from '../Companion/TodayBadge'
import ActivityCheckbox from '../Companion/ActivityCheckbox'
import ActivityNotes from '../Companion/ActivityNotes'
import ActualCostInput from '../Companion/ActualCostInput'
import NearbyBadge from '../Companion/NearbyBadge'

/**
 * companion prop (optional — only passed by ItineraryDetailPage when trip.startDate is set):
 *   {
 *     isToday, tripDate,
 *     onActivityUpdate(dayIndex, updatedDay),
 *     weatherRefreshEl?,          — rendered in card header (display only)
 *     geo?: { status, position, onRequest, onDismiss }  — drives NearbyBadge + jump-to-activity
 *   }
 * Absence of companion prop disables all companion UI (PlannerPage, PublicTripPage).
 */
const TimelineDay = ({ day, index, defaultOpen = true, weather, companion }) => {
  const [open, setOpen] = useState(defaultOpen)
  const { currency, usdToInr } = useCurrency()

  // Activity-level refs so NearbyBadge can scroll to the matched activity
  const activityRefs = useRef([])
  // Which activity index is currently highlighted (pulsing ring, auto-clears after 3s)
  const [highlightedIdx, setHighlightedIdx] = useState(null)
  const highlightTimerRef = useRef(null)

  const hasCompanion = !!companion

  const handleToggle = (actIdx) => {
    const updated = {
      ...day,
      activities: day.activities.map((a, i) =>
        i === actIdx ? { ...a, checked: !a.checked } : a
      ),
    }
    companion?.onActivityUpdate(index, updated)
  }

  const handleNotesSave = (actIdx, notes) => {
    const updated = {
      ...day,
      activities: day.activities.map((a, i) =>
        i === actIdx ? { ...a, notes: notes ?? undefined } : a
      ),
    }
    companion?.onActivityUpdate(index, updated)
  }

  const handleActualCostSave = (actIdx, { usdValue, capturedRate, capturedAt }) => {
    const updated = {
      ...day,
      activities: day.activities.map((a, i) => {
        if (i !== actIdx) return a
        const next = { ...a, actualCost: usdValue ?? undefined }
        if (capturedRate != null) next.actualCostUsdRate = capturedRate
        if (capturedAt != null) next.actualCostCapturedAt = capturedAt
        if (usdValue == null) {
          delete next.actualCostUsdRate
          delete next.actualCostCapturedAt
        }
        return next
      }),
    }
    companion?.onActivityUpdate(index, updated)
  }

  // Called by NearbyBadge when user taps "Jump to this activity"
  const handleJumpToActivity = useCallback((actIdx) => {
    // Ensure card is open first
    setOpen(true)

    // Small delay so the open animation finishes before we scroll
    setTimeout(() => {
      activityRefs.current[actIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Clear any existing highlight timer
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      setHighlightedIdx(actIdx)
      highlightTimerRef.current = setTimeout(() => setHighlightedIdx(null), 3500)
    }, 80)
  }, [])

  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden ${companion?.isToday ? 'ring-2 ring-indigo-300' : ''}`}>
      {/* ── Card header ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-primary-50 px-5 py-4 flex items-center justify-between hover:bg-primary-100 transition"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-gray-800">{day.title || `Day ${index + 1}`}</h3>
          {companion?.isToday && <TodayBadge date={companion.tripDate} />}
          {weather && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-full">
              <span className="text-sm leading-none">{weatherIconFor(weather.weatherCode)}</span>
              <span>{weatherTextFor(weather.weatherCode)}</span>
              <span className="text-sky-500">·</span>
              <span>{Math.round(weather.tempMinC)}°–{Math.round(weather.tempMaxC)}°C</span>
              {weather.precipitationProb > 60 && (
                <span className="flex items-center gap-0.5 text-amber-700 ml-0.5">
                  <Umbrella className="w-3 h-3" /> {weather.precipitationProb}%
                </span>
              )}
            </div>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-primary-500" /> : <ChevronDown className="w-5 h-5 text-primary-500" />}
      </button>

      {/* ── Card body ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="p-5 space-y-4">
          {/* Weather refresh indicator — full-width banner at top of body, easy to spot.
              Gated on weatherRefreshActive (a boolean) not weatherRefreshEl (a React element
              object, which is always truthy even when the component renders null). */}
          {companion?.weatherRefreshActive && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              {companion.weatherRefreshEl}
              <span className="text-xs text-emerald-600 hidden sm:block">Live forecast</span>
            </div>
          )}

          {/* NearbyBadge — only on today's card when geo prop is provided */}
          {companion?.isToday && companion?.geo && (
            <div className="pb-3 border-b border-slate-100">
              <NearbyBadge
                activities={day.activities}
                status={companion.geo.status}
                position={companion.geo.position}
                onRequest={companion.geo.onRequest}
                onDismiss={companion.geo.onDismiss}
                onJumpTo={handleJumpToActivity}
                destination={companion.geo.destination}
              />
            </div>
          )}

          {/* Activity list */}
          {day.activities?.map((activity, idx) => (
            <div
              key={idx}
              ref={el => activityRefs.current[idx] = el}
              className={[
                'flex gap-4 rounded-xl transition-all duration-500',
                activity.checked ? 'opacity-60' : '',
                highlightedIdx === idx
                  ? 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50/40 px-2 -mx-2'
                  : '',
              ].join(' ')}
            >
              {hasCompanion && (
                <div className="flex-shrink-0 pt-1">
                  <ActivityCheckbox
                    checked={!!activity.checked}
                    onToggle={() => handleToggle(idx)}
                  />
                </div>
              )}
              <div className="flex-shrink-0 w-20">
                <span className="bg-slate-50 text-slate-700 font-semibold px-2 py-1 rounded-lg text-sm block text-center">
                  {activity.time || `${9 + idx}:00`}
                </span>
              </div>
              <div className="border-l-2 border-primary-100 pl-4 flex-1">
                <h4 className={`font-semibold text-gray-800 ${activity.checked ? 'line-through text-slate-400' : ''}`}>
                  {activity.title}
                  {highlightedIdx === idx && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide align-middle">
                      📍 You&apos;re here
                    </span>
                  )}
                </h4>
                {activity.description && (
                  <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
                )}
                {activity.cost > 0 && (
                  <p className="text-primary-600 text-sm mt-1 font-medium">
                    ~ {formatCurrency(activity.cost, currency, usdToInr)}
                  </p>
                )}
                {hasCompanion && (
                  <>
                    <ActualCostInput
                      estimatedCost={activity.cost}
                      actualCost={activity.actualCost}
                      actualCostUsdRate={activity.actualCostUsdRate}
                      onSave={(payload) => handleActualCostSave(idx, payload)}
                    />
                    <ActivityNotes
                      notes={activity.notes}
                      onSave={(notes) => handleNotesSave(idx, notes)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimelineDay
