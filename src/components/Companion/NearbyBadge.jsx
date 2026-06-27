import React from 'react'
import { MapPin, ArrowDown, X, Navigation, Globe } from 'lucide-react'
import { nearestActivity, closestActivity, formatDistance } from '../../utils/geo'

// If the closest geo-activity is further than this, the user is in a different city.
const WRONG_CITY_KM = 50

/**
 * Opt-in geolocation affordance for today's day card.
 *
 * States:
 *   idle        → "Find nearest activity" button (only when activities have lat/lng)
 *   requesting  → spinner row
 *   granted, within 5 km  → activity card + "Jump to it" CTA
 *   granted, 5–50 km      → "No activities within 5 km"
 *   granted, > 50 km      → "You're not in [Destination] yet" — explains why the feature is silent
 *   denied / unavailable  → hidden
 */
const NearbyBadge = ({ activities, status, position, onRequest, onDismiss, onJumpTo, destination }) => {
  if (status === 'unavailable' || status === 'denied') return null

  const hasGeoActivities =
    Array.isArray(activities) && activities.some(a => a.lat != null && a.lng != null)

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (status === 'idle') {
    if (!hasGeoActivities) return null
    if (typeof navigator !== 'undefined' && !navigator.geolocation) return null

    return (
      <button
        type="button"
        onClick={onRequest}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl
          border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50
          text-amber-800 font-semibold text-sm
          hover:from-amber-100 hover:to-orange-100 hover:border-amber-400
          active:scale-[0.99] transition-all duration-150 shadow-sm"
      >
        <Navigation className="w-4 h-4 text-amber-600" />
        Find nearest activity
      </button>
    )
  }

  // ── Requesting ────────────────────────────────────────────────────────────
  if (status === 'requesting') {
    return (
      <div className="flex items-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-500 font-medium">Finding your location…</span>
      </div>
    )
  }

  // ── Granted ───────────────────────────────────────────────────────────────
  if (status === 'granted' && position) {
    const nearest = nearestActivity(activities, position.latitude, position.longitude)

    // ── Found within 5 km ─────────────────────────────────────────────────
    if (nearest) {
      return (
        <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">
                You&apos;re nearby
              </p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {nearest.activity.title}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {nearest.activity.time && <span className="mr-1.5">{nearest.activity.time}</span>}
                <span className="font-semibold">{formatDistance(nearest.distanceKm)} away</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onJumpTo?.(nearest.activityIndex)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg
              bg-amber-500 hover:bg-amber-600 active:bg-amber-700
              text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Jump to this activity
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Stop showing nearby hints
          </button>
        </div>
      )
    }

    // ── Nothing within 5 km — check if user is in wrong city ─────────────
    const closest = closestActivity(activities, position.latitude, position.longitude)
    const isWrongCity = closest != null && closest.distanceKm > WRONG_CITY_KM

    if (isWrongCity) {
      // User is clearly not at the destination — give them a useful explanation
      const destLabel = destination ? destination.split(',')[0].trim() : 'your destination'

      return (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-indigo-900 leading-snug">
                You&apos;re not in {destLabel} yet
              </p>
              <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
                Your nearest planned stop is{' '}
                <span className="font-semibold">{formatDistance(closest.distanceKm)}</span> from
                your current location. This feature works when you&apos;re at your destination.
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="text-indigo-300 hover:text-indigo-500 transition flex-shrink-0 mt-0.5"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-3 w-full py-1.5 rounded-lg border border-indigo-200 text-xs font-semibold
              text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            Got it — I&apos;ll check back when I arrive
          </button>
        </div>
      )
    }

    // ── User is nearby-ish but no activity within 5 km ────────────────────
    return (
      <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
          No planned activities within 5 km of you
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-300 hover:text-slate-500 transition ml-2 flex-shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return null
}

export default NearbyBadge
