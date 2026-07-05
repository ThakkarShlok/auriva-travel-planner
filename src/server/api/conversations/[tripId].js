import { requireUser, AuthError } from '../_lib/auth.js'
import { getConversationForTrip } from '../../../db/queries/conversations.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const tripId = req.query?.tripId
    if (!tripId) return res.status(400).json({ error: 'tripId required' })

    const messages = await getConversationForTrip(tripId, user.id)
    return res.status(200).json({ messages })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api/conversations/:tripId]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
