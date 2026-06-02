const AUTH_KEY = 'travel_app_auth'
const ITINERARY_KEY = 'travel_app_itinerary'

export function loadAuthState() {
  if (typeof window === 'undefined') return null
  const serialized = window.localStorage.getItem(AUTH_KEY)
  return serialized ? JSON.parse(serialized) : null
}

export function saveAuthState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

export function clearAuthState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_KEY)
}

export function loadItineraryState() {
  if (typeof window === 'undefined') return null
  const serialized = window.localStorage.getItem(ITINERARY_KEY)
  return serialized ? JSON.parse(serialized) : null
}

export function saveItineraryState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ITINERARY_KEY, JSON.stringify(state))
}
