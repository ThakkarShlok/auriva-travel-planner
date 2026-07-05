import { getPublicTripBySlug } from '../../db/queries/trips.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const slug = req.query?.slug
    if (!slug) return res.status(400).json({ error: 'slug required' })

    const trip = await getPublicTripBySlug(slug)
    if (!trip) return res.status(404).json({ error: 'Shared trip not found' })

    // Strip internal/owner-identifying fields before returning to public
    const publicData = {
      destination: trip.destination,
      duration: trip.duration,
      travelers: trip.travelers,
      budget: trip.budget,
      interests: trip.interests,
      overview: trip.overview,
      budgetBreakdown: trip.budgetBreakdown,
      hotels: trip.hotels,
      packing: trip.packing,
      tips: trip.tips,
      weather: trip.weather,
      days: trip.days.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        activities: d.activities,
      })),
      sharedAt: trip.sharedAt,
    }

    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate')
    return res.status(200).json({ trip: publicData })

  } catch (error) {
    console.error('[api public-trip]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
