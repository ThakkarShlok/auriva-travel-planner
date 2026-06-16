import { requireUser, AuthError } from '../_lib/auth.js'
import { getTripsForUser, createTrip } from '../../src/db/queries/trips.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)

    if (req.method === 'GET') {
      const trips = await getTripsForUser(user.id)
      return res.status(200).json({ trips })
    }

    if (req.method === 'POST') {
      const { preferences, generated } = req.body ?? {}

      if (!preferences?.destination || !preferences?.duration) {
        return res.status(400).json({ error: 'preferences.destination and preferences.duration are required' })
      }
      if (!generated || typeof generated !== 'object') {
        return res.status(400).json({ error: 'generated itinerary object is required' })
      }

      const trip = await createTrip({ userId: user.id, preferences, generated })
      return res.status(201).json({ trip })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api/trips]', error.message, error.stack?.split('\n').slice(0, 3).join(' | '))
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
