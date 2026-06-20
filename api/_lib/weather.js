import { getCachedWeather, upsertWeather } from '../../src/db/queries/weather.js'

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export class WeatherError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'WeatherError'
    this.status = status
  }
}

// Primary geocoder — fast, no rate-limit policy, but its GeoNames index only
// covers cities/towns directly. State/region/colloquial names ("Sikkim",
// "Coorg") return zero results even though the place is real.
async function geocodeOpenMeteo(query) {
  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const r = data?.results?.[0]
    if (!r) return null
    return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country }
  } catch {
    return null
  }
}

// Fallback geocoder — OpenStreetMap Nominatim, free, no API key. Built on OSM
// data, which indexes states/regions/landmarks that GeoNames misses. Only
// called when the primary geocoder returns nothing, so usage stays low and
// respects Nominatim's ~1 req/sec public-instance policy.
async function geocodeNominatim(query) {
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Auriva-TravelPlanner/1.0 (support.auriva@gmail.com)' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const r = data?.[0]
    if (!r) return null
    const parts = (r.display_name || '').split(',').map(s => s.trim())
    return {
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      name: r.name || parts[0] || query,
      country: parts[parts.length - 1] || '',
    }
  } catch {
    return null
  }
}

/**
 * Returns normalized weather for a destination.
 * Hits the 6-hour cache first; falls back to Open-Meteo geocoding, then
 * Nominatim geocoding, then the forecast API.
 * Returns null on any failure — weather is enrichment, not critical path.
 */
export async function getWeatherForDestination(destination) {
  if (!destination || typeof destination !== 'string') return null

  try {
    const cached = await getCachedWeather(destination)
    if (cached) {
      return {
        latitude: cached.latitude,
        longitude: cached.longitude,
        forecast: cached.forecast,
        cached: true,
      }
    }

    const trimmed = destination.trim()
    const place = await geocodeOpenMeteo(trimmed) ?? await geocodeNominatim(trimmed)

    if (!place) {
      console.log('[weather] no geocoding result for:', destination)
      return null
    }

    const fcUrl = `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
      `&forecast_days=14&timezone=auto`
    const fcRes = await fetch(fcUrl)
    if (!fcRes.ok) throw new WeatherError(`Forecast API ${fcRes.status}`, 502)
    const fcData = await fcRes.json()

    if (!fcData?.daily?.time || !Array.isArray(fcData.daily.time)) {
      throw new WeatherError('Malformed forecast response')
    }

    const daily = fcData.daily.time.map((date, idx) => ({
      date,
      tempMaxC: fcData.daily.temperature_2m_max[idx],
      tempMinC: fcData.daily.temperature_2m_min[idx],
      precipitationProb: fcData.daily.precipitation_probability_max[idx],
      weatherCode: fcData.daily.weather_code[idx],
    }))

    const forecast = {
      timezone: fcData.timezone,
      placeName: place.name,
      country: place.country,
      daily,
    }

    upsertWeather({
      destination,
      latitude: place.latitude,
      longitude: place.longitude,
      forecast,
    }).catch((err) => console.error('[weather cache upsert]', err.message))

    return {
      latitude: place.latitude,
      longitude: place.longitude,
      forecast,
      cached: false,
    }

  } catch (error) {
    console.error('[weather]', error.message)
    return null
  }
}

/**
 * Builds a compact weather context string for inclusion in the AI system prompt.
 * Returns null if no weather available.
 */
export function buildWeatherPromptContext(weatherData, tripStartDate, tripDuration) {
  if (!weatherData?.forecast?.daily) return null

  const daily = weatherData.forecast.daily
  const startIdx = tripStartDate
    ? daily.findIndex(d => d.date >= tripStartDate)
    : 0
  if (startIdx === -1) return null

  const tripDays = daily.slice(startIdx, startIdx + tripDuration)
  if (tripDays.length === 0) return null

  const summary = tripDays.map((d, i) => {
    const day = i + 1
    const condition = weatherCodeToText(d.weatherCode)
    const rain = d.precipitationProb > 60 ? ' (high rain chance)' : ''
    return `Day ${day} (${d.date}): ${d.tempMinC}–${d.tempMaxC}°C, ${condition}${rain}`
  }).join('\n')

  return `Weather forecast for ${weatherData.forecast.placeName}:\n${summary}\n\nUse this forecast when planning. Suggest indoor alternatives on rainy days. Recommend appropriate clothing in packing list. Adjust activity timing for hot/cold days.`
}

function weatherCodeToText(code) {
  if (code === 0) return 'clear sky'
  if (code <= 3) return 'partly cloudy'
  if (code <= 48) return 'foggy'
  if (code <= 67) return 'rainy'
  if (code <= 77) return 'snowy'
  if (code <= 82) return 'rain showers'
  if (code <= 86) return 'snow showers'
  if (code <= 99) return 'thunderstorm'
  return 'mixed'
}
