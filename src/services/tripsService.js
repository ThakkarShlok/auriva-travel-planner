import { enqueue } from '../utils/mutationQueue.js'

// All functions take a `getToken` argument — components call useAuth().getToken() and pass it in.
// This keeps hooks out of the service layer.

async function authFetch(url, options, getToken) {
  const token = await getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status}`
    try {
      const body = await response.json()
      errorMsg = body.error || errorMsg
    } catch {}
    const err = new Error(errorMsg)
    err.status = response.status
    throw err
  }

  return response.json()
}

export async function listTrips(getToken) {
  const data = await authFetch('/api/trips', { method: 'GET' }, getToken)
  return data.trips
}

export async function getTrip(tripId, getToken) {
  const data = await authFetch(`/api/trips/${tripId}`, { method: 'GET' }, getToken)
  return data.trip
}

export async function saveTrip({ preferences, generated }, getToken) {
  const data = await authFetch('/api/trips', {
    method: 'POST',
    body: JSON.stringify({ preferences, generated }),
  }, getToken)
  return data.trip
}

export async function deleteTrip(tripId, getToken) {
  await authFetch(`/api/trips/${tripId}`, { method: 'DELETE' }, getToken)
}

export async function duplicateTrip(tripId, getToken) {
  const data = await authFetch('/api/trips/duplicate', {
    method: 'POST',
    body: JSON.stringify({ tripId }),
  }, getToken)
  return data.trip
}

export async function refineTrip({ tripId, instruction }, getToken) {
  const data = await authFetch('/api/refine-itinerary', {
    method: 'POST',
    body: JSON.stringify({ tripId, instruction }),
  }, getToken)
  return data.itinerary
}

export async function getConversation(tripId, getToken) {
  const data = await authFetch(`/api/conversations/${tripId}`, { method: 'GET' }, getToken)
  return data.messages
}

export async function shareTrip(tripId, getToken) {
  const data = await authFetch('/api/share', {
    method: 'POST',
    body: JSON.stringify({ tripId }),
  }, getToken)
  return data  // { slug, sharedAt }
}

export async function unshareTrip(tripId, getToken) {
  await authFetch('/api/share', {
    method: 'DELETE',
    body: JSON.stringify({ tripId }),
  }, getToken)
}

export async function downloadTripPDF(tripId, getToken) {
  const token = await getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`/api/download-pdf?tripId=${encodeURIComponent(tripId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    let errorMsg = `PDF download failed: ${response.status}`
    try {
      const body = await response.json()
      errorMsg = body.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  await triggerDownload(response)
}

export async function downloadPublicTripPDF(slug) {
  const response = await fetch(`/api/download-pdf?slug=${encodeURIComponent(slug)}`)
  if (!response.ok) {
    let errorMsg = `PDF download failed: ${response.status}`
    try {
      const body = await response.json()
      errorMsg = body.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }
  await triggerDownload(response)
}

async function triggerDownload(response) {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="(.+?)"/)
  a.download = match ? match[1] : 'auriva-trip.pdf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ─── Companion mode ───────────────────────────────────────────────────────────

export async function patchTripDay(tripId, dayIndex, day, getToken) {
  if (!navigator.onLine) {
    enqueue({
      dedupeKey: `${tripId}:day:${dayIndex}`,
      endpoint: `/api/trips/${tripId}`,
      method: 'PATCH',
      body: { dayIndex, day },
    })
    return { offline: true }
  }

  const data = await authFetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify({ dayIndex, day }),
  }, getToken)
  return data.trip
}

export async function patchPackingChecklist(tripId, checklist, getToken) {
  if (!navigator.onLine) {
    enqueue({
      dedupeKey: `${tripId}:packing`,
      endpoint: `/api/trips/${tripId}`,
      method: 'PATCH',
      body: { packingChecklist: checklist },
    })
    return { offline: true }
  }

  const data = await authFetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify({ packingChecklist: checklist }),
  }, getToken)
  return data.trip
}

// Phase 11a: semantic wrapper ensuring actualCost, actualCostUsdRate, actualCostCapturedAt
// always move as a unit. The day object must include the updated activity with all three fields.
export async function patchTripActualCost(tripId, dayIndex, day, getToken) {
  return patchTripDay(tripId, dayIndex, day, getToken)
}

// No auth — public endpoint
export async function fetchPublicTrip(slug) {
  const response = await fetch(`/api/public-trip?slug=${encodeURIComponent(slug)}`)
  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status}`
    try {
      const body = await response.json()
      errorMsg = body.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }
  const data = await response.json()
  return data.trip
}
