import { requireUser, AuthError } from '../_lib/auth.js'
import { getTripById, updateTripWeatherRefreshedAt } from '../../../db/queries/trips.js'
import { geocodeDestination } from '../_lib/weather.js'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * GET /api/weather/refresh?tripId=xxx
 *
 * Returns a fresh 3-day forecast for the trip's location.
 * Two paths:
 *   1. Trip has cached lat/lng in trips.weather  → fetch directly (fast)
 *   2. No stored coords → lightweight geocode from trip.destination, then fetch
 *
 * Does NOT overwrite trips.weather JSONB (historical record is preserved).
 * Updates trips.weather_refreshed_at on success — if that update fails the
 * forecast is still returned (non-fatal).
 * Returns { forecast: DailyEntry[], refreshedAt: ISO string }
 */
export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    const tripId = req.query?.tripId
    if (!tripId) return res.status(400).json({ error: 'tripId query param required' })

    const trip = await getTripById(tripId, user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    let lat = trip.weather?.latitude
    let lng = trip.weather?.longitude

    // For old trips without stored coords: lightweight geocode (no 14-day fetch, no DB write)
    if ((lat == null || lng == null) && trip.destination) {
      try {
        const geo = await geocodeDestination(trip.destination)
        if (geo) { lat = geo.latitude; lng = geo.longitude }
      } catch (geoErr) {
        console.error('[api/weather/refresh] geocode fallback failed:', geoErr.message)
        // Continue — will return no_coords below
      }
    }

    if (lat == null || lng == null) {
      return res.status(200).json({ forecast: null, reason: 'no_coords' })
    }

    // Fetch 3-day forecast directly from Open-Meteo
    let fcData
    try {
      const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lng}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
        `&forecast_days=3&timezone=auto`
      const fcRes = await fetch(url)
      if (!fcRes.ok) {
        console.error('[api/weather/refresh] Open-Meteo returned', fcRes.status)
        return res.status(502).json({ error: `Open-Meteo returned ${fcRes.status}` })
      }
      fcData = await fcRes.json()
    } catch (fetchErr) {
      console.error('[api/weather/refresh] Open-Meteo fetch threw:', fetchErr.message)
      return res.status(502).json({ error: 'Could not reach forecast service' })
    }

    if (!Array.isArray(fcData?.daily?.time)) {
      return res.status(502).json({ error: 'Malformed forecast response' })
    }

    const forecast = fcData.daily.time.map((date, idx) => ({
      date,
      tempMaxC: fcData.daily.temperature_2m_max[idx],
      tempMinC: fcData.daily.temperature_2m_min[idx],
      precipitationProb: fcData.daily.precipitation_probability_max[idx],
      weatherCode: fcData.daily.weather_code[idx],
    }))

    const refreshedAt = new Date()

    // Stamp the refresh time — non-fatal: a missing column or transient DB error
    // should not prevent the forecast from reaching the user.
    try {
      await updateTripWeatherRefreshedAt(tripId, user.id, refreshedAt)
    } catch (stampErr) {
      console.error('[api/weather/refresh] timestamp stamp failed:', stampErr.message)
    }

    return res.status(200).json({ forecast, refreshedAt: refreshedAt.toISOString() })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api/weather/refresh] unexpected error:', error.message, error.stack)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
