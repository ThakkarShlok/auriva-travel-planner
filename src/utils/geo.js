const R_KM = 6371 // Earth radius in km

/**
 * Haversine distance between two lat/lng pairs, in km.
 * Standard formula, accurate to within ~0.3% for terrestrial distances.
 */
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R_KM * 2 * Math.asin(Math.sqrt(a))
}

/**
 * Find the nearest activity (within today's day) to the user's position.
 * Only considers activities that have lat + lng fields.
 * Returns null if none found or all are > 5 km away.
 *
 * @param {Array}  activities   - Activities array from a single day
 * @param {number} userLat
 * @param {number} userLng
 * @returns {{ activity, distanceKm, activityIndex } | null}
 */
export function nearestActivity(activities, userLat, userLng) {
  if (!Array.isArray(activities) || userLat == null || userLng == null) return null

  let best = null

  activities.forEach((activity, activityIndex) => {
    if (activity.lat == null || activity.lng == null) return
    const distanceKm = haversineDistanceKm(userLat, userLng, activity.lat, activity.lng)
    if (distanceKm > 5) return // beyond meaningful "nearby" threshold
    if (!best || distanceKm < best.distanceKm) {
      best = { activity, distanceKm, activityIndex }
    }
  })

  return best
}

/**
 * Find the closest geo-activity to the user with no distance cutoff.
 * Used to detect "wrong city" — if the closest is hundreds of km away
 * the user is clearly not at the destination yet.
 *
 * @returns {{ activity, distanceKm, activityIndex } | null}
 */
export function closestActivity(activities, userLat, userLng) {
  if (!Array.isArray(activities) || userLat == null || userLng == null) return null

  let best = null

  activities.forEach((activity, activityIndex) => {
    if (activity.lat == null || activity.lng == null) return
    const distanceKm = haversineDistanceKm(userLat, userLng, activity.lat, activity.lng)
    if (!best || distanceKm < best.distanceKm) {
      best = { activity, distanceKm, activityIndex }
    }
  })

  return best
}

/**
 * Human-readable distance string.
 * < 1 km   → "120 m"
 * < 100 km → "1.4 km"
 * ≥ 100 km → "1,400 km"  (no decimal — communicates "you're in a different city")
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString()} km`
}
