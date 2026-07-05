import { requireUser, AuthError } from '../_lib/auth.js'
import {
  getRecentGenerations,
  getMetricsSummary,
  getDailyVolume,
  getEndpointBreakdown,
} from '../../../db/queries/generationLogs.js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean)

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const user = await requireUser(req)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const [summary, dailyVolume, endpointBreakdown, recent] = await Promise.all([
      getMetricsSummary({ since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }),
      getDailyVolume({ days: 14 }),
      getEndpointBreakdown({ since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }),
      getRecentGenerations(20),
    ])

    return res.status(200).json({
      summary,
      dailyVolume,
      endpointBreakdown,
      recent: recent.map(r => ({
        ...r,
        errorMessage: r.errorMessage?.slice(0, 200),
      })),
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('[api admin metrics]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
