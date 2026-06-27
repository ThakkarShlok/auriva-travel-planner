import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

/**
 * Fetches a fresh 3-day forecast for the trip's destination after first paint.
 * Only fires when isToday is true and the trip has cached lat/lng in trip.weather.
 * Degrades silently on every failure mode — offline, rate-limited, old trip without coords.
 *
 * Returns:
 *   refreshing    — true during the in-flight fetch
 *   lastRefreshed — Date | null
 *   freshForecast — fresh daily array (3 days) | null (falls back to cached trip.weather.daily)
 */
export default function useLiveWeatherRefresh(trip, isToday) {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [freshForecast, setFreshForecast] = useState(null)
  const { getToken } = useAuth()

  useEffect(() => {
    if (!isToday) return
    if (!trip?.id) return
    if (!trip?.weather?.latitude || !trip?.weather?.longitude) return // old trip, no coords

    let cancelled = false
    const controller = new AbortController()
    setRefreshing(true)

    ;(async () => {
      try {
        const token = await getToken()
        if (!token || cancelled) return
        const res = await fetch(`/api/weather/refresh?tripId=${trip.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled || !data?.forecast) return
        setFreshForecast(data.forecast)
        setLastRefreshed(new Date())
      } catch {
        // Silent — keep cached forecast, no error UI
      } finally {
        if (!cancelled) setRefreshing(false)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [trip?.id, isToday]) // eslint-disable-line react-hooks/exhaustive-deps

  return { refreshing, lastRefreshed, freshForecast }
}
