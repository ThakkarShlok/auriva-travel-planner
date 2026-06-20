import React from 'react'
import { CloudSun, Umbrella } from 'lucide-react'
import Card from './Card'
import { weatherIconFor, weatherTextFor } from '../../utils/weather'

// daily: full forecast array (may include days beyond the trip) — sliced to `duration` here.
// destination: shown in the fallback message when no forecast could be found —
// keeps "no weather" honest and visible instead of the card silently disappearing.
const WeatherForecastCard = ({ daily, duration, destination }) => {
  const days = Array.isArray(daily) ? (duration ? daily.slice(0, duration) : daily) : []

  if (days.length === 0) {
    return (
      <Card padding="md">
        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-slate-400" />
          Weather Forecast
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {destination
            ? `Weather forecast unavailable for "${destination}" — try a more specific city or town name for better coverage.`
            : 'Weather forecast unavailable for this trip.'}
        </p>
      </Card>
    )
  }

  const rainyDayNumbers = days
    .map((d, i) => ({ dayNumber: i + 1, rainy: d.precipitationProb > 60 }))
    .filter(d => d.rainy)
    .map(d => d.dayNumber)

  return (
    <Card padding="md">
      <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <CloudSun className="w-4 h-4 text-sky-600" />
        Weather Forecast
      </h3>
      <div className="space-y-2">
        {days.map((d, i) => (
          <div key={i} className="flex items-center justify-between bg-sky-50 border border-sky-100 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">{weatherIconFor(d.weatherCode)}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Day {i + 1}</p>
                <p className="text-xs text-slate-500">{weatherTextFor(d.weatherCode)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">
                {Math.round(d.tempMinC)}°–{Math.round(d.tempMaxC)}°C
              </p>
              {d.precipitationProb > 60 && (
                <p className="text-xs text-amber-700 font-medium flex items-center justify-end gap-0.5">
                  <Umbrella className="w-3 h-3" /> {d.precipitationProb}% rain
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {rainyDayNumbers.length > 0 && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Umbrella className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Day{rainyDayNumbers.length > 1 ? 's' : ''} {rainyDayNumbers.join(', ')} {rainyDayNumbers.length > 1 ? 'have' : 'has'} a high chance of rain —
            this itinerary swaps in indoor activities where possible.
          </p>
        </div>
      )}
    </Card>
  )
}

export default WeatherForecastCard
