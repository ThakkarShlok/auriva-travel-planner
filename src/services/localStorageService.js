const KEYS = {
  AUTH: 'auriva_auth',
  USERS: 'auriva_users',
  ONBOARDING: 'auriva_onboarding',
}

const isBrowser = typeof window !== 'undefined'

function safeGet(key) {
  if (!isBrowser) return null
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function safeSet(key, value) {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled — fail silently
  }
}

function safeRemove(key) {
  if (!isBrowser) return
  window.localStorage.removeItem(key)
}

function getTripsKey(userId) {
  return userId ? `auriva_trips_${userId}` : 'auriva_trips_anonymous'
}

export const storage = {
  keys: KEYS,
  get: safeGet,
  set: safeSet,
  remove: safeRemove,
  getTripsKey,
}

export const loadAuthState = () => safeGet(KEYS.AUTH)
export const saveAuthState = (state) => safeSet(KEYS.AUTH, state)
export const clearAuthState = () => safeRemove(KEYS.AUTH)
