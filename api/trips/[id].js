import { requireUser, AuthError } from '../_lib/auth.js'
import {
  getTripWithDays,
  updateTripDays,
  updateTripMetadata,
  updateTripDay,
  updateTripPackingChecklist,
  deleteTrip,
} from '../../src/db/queries/trips.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    const tripId = req.query?.id

    if (!tripId) return res.status(400).json({ error: 'Trip ID required' })

    if (req.method === 'GET') {
      const trip = await getTripWithDays(tripId, user.id)
      if (!trip) return res.status(404).json({ error: 'Trip not found' })
      return res.status(200).json({ trip })
    }

    if (req.method === 'PATCH') {
      const body = req.body ?? {}

      // Single-day companion patch: { dayIndex, day }
      if (body.dayIndex != null && body.day != null) {
        const dayIndex = Number(body.dayIndex)
        if (!Number.isInteger(dayIndex) || dayIndex < 0) {
          return res.status(400).json({ error: 'dayIndex must be a non-negative integer' })
        }
        const day = body.day
        if (!Array.isArray(day.activities)) {
          return res.status(400).json({ error: 'day.activities must be an array' })
        }
        if (day.activities.some(a => !a.title)) {
          return res.status(400).json({ error: 'Every activity must have a title' })
        }
        const updated = await updateTripDay(tripId, user.id, dayIndex, day)
        if (!updated) return res.status(404).json({ error: 'Trip or day not found' })
        const full = await getTripWithDays(tripId, user.id)
        return res.status(200).json({ trip: full })
      }

      // Packing checklist patch: { packingChecklist }
      if (body.packingChecklist != null) {
        if (!Array.isArray(body.packingChecklist)) {
          return res.status(400).json({ error: 'packingChecklist must be an array' })
        }
        const updated = await updateTripPackingChecklist(tripId, user.id, body.packingChecklist)
        if (!updated) return res.status(404).json({ error: 'Trip not found' })
        return res.status(200).json({ trip: updated })
      }

      // Full refinement patch: { days, metadata }
      const { days, metadata } = body
      if (days) await updateTripDays(tripId, user.id, days)
      if (metadata) await updateTripMetadata(tripId, user.id, metadata)
      const updated = await getTripWithDays(tripId, user.id)
      return res.status(200).json({ trip: updated })
    }

    if (req.method === 'DELETE') {
      const ok = await deleteTrip(tripId, user.id)
      if (!ok) return res.status(404).json({ error: 'Trip not found' })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api/trips/:id]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
