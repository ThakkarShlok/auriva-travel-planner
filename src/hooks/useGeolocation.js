import { useState, useCallback } from 'react'

/**
 * Opt-in geolocation hook for the Today card's "Find nearest activity" feature.
 * Never auto-requests; only fires when the user explicitly clicks the button.
 * All state is component-local — nothing written to storage.
 *
 * dismiss() resets to idle so the button is immediately available again.
 * The user controls when to request — they can invoke it as many times as they want.
 *
 * Status values:
 *   idle        — default; button is visible and clickable
 *   requesting  — browser permission prompt / GPS lookup in flight
 *   granted     — position resolved; NearbyBadge shows result card
 *   denied      — browser denied permission; button hidden until next page load
 *   unavailable — navigator.geolocation absent; button hidden
 */
export default function useGeolocation() {
  const [status, setStatus] = useState('idle')
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }

    setStatus('requesting')
    setPosition(null)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos.coords)
        setStatus('granted')
      },
      (err) => {
        setError(err.message)
        setStatus('denied')
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    )
  }, [])

  // Closes the result card and returns the button to idle so the user can re-invoke.
  const dismiss = useCallback(() => {
    setStatus('idle')
    setPosition(null)
    setError(null)
  }, [])

  return { status, position, error, request, dismiss }
}
