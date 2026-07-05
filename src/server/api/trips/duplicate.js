import { requireUser, AuthError } from '../_lib/auth.js'
import { duplicateTrip } from '../../../db/queries/trips.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { tripId } = req.body ?? {}
    if (!tripId) return res.status(400).json({ error: 'tripId required' })

    const newTrip = await duplicateTrip(tripId, user.id)
    if (!newTrip) return res.status(404).json({ error: 'Trip not found' })

    return res.status(201).json({ trip: newTrip })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api/trips/duplicate]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
