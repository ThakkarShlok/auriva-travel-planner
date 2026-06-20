import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Umbrella } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'
import { formatCurrency } from '../../utils/currency'
import { weatherIconFor, weatherTextFor } from '../../utils/weather'
import TodayBadge from '../Companion/TodayBadge'
import ActivityCheckbox from '../Companion/ActivityCheckbox'
import ActivityNotes from '../Companion/ActivityNotes'
import ActualCostInput from '../Companion/ActualCostInput'

/**
 * companion prop (optional — only passed by ItineraryDetailPage when trip.startDate is set):
 *   { isToday, tripDate, onActivityUpdate(dayIndex, updatedDay) }
 * Absence of companion prop disables all companion UI (PlannerPage, PublicTripPage).
 */
const TimelineDay = ({ day, index, defaultOpen = true, weather, companion }) => {
  const [open, setOpen] = useState(defaultOpen)
  const { currency, usdToInr } = useCurrency()

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

  const handleActualCostSave = (actIdx, actualCost) => {
    const updated = {
      ...day,
      activities: day.activities.map((a, i) =>
        i === actIdx ? { ...a, actualCost: actualCost ?? undefined } : a
      ),
    }
    companion?.onActivityUpdate(index, updated)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden ${companion?.isToday ? 'ring-2 ring-indigo-300' : ''}`}>
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

      {open && (
        <div className="p-5 space-y-4">
          {day.activities?.map((activity, idx) => (
            <div key={idx} className={`flex gap-4 ${activity.checked ? 'opacity-60' : ''}`}>
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
                      onSave={(val) => handleActualCostSave(idx, val)}
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
