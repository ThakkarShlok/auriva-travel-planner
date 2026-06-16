import { requireUser, AuthError } from './_lib/auth.js'
import { shareTrip, unshareTrip } from '../src/db/queries/trips.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)

    if (req.method === 'POST') {
      const { tripId } = req.body ?? {}
      if (!tripId) return res.status(400).json({ error: 'tripId required' })

      const updated = await shareTrip(tripId, user.id)
      if (!updated) return res.status(404).json({ error: 'Trip not found or not owned' })

      return res.status(200).json({ slug: updated.shareSlug, sharedAt: updated.sharedAt })
    }

    if (req.method === 'DELETE') {
      const { tripId } = req.body ?? {}
      if (!tripId) return res.status(400).json({ error: 'tripId required' })

      const updated = await unshareTrip(tripId, user.id)
      if (!updated) return res.status(404).json({ error: 'Trip not found or not owned' })

      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('[api share]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
