import health from '../src/server/api/health.js'
import generateItinerary from '../src/server/api/generate-itinerary.js'
import generateItineraryStream from '../src/server/api/generate-itinerary-stream.js'
import refineItinerary from '../src/server/api/refine-itinerary.js'
import chat from '../src/server/api/chat.js'
import clerkWebhook from '../src/server/api/webhooks/clerk.js'
import syncUser from '../src/server/api/sync-user.js'
import tripsIndex from '../src/server/api/trips/index.js'
import tripsDuplicate from '../src/server/api/trips/duplicate.js'
import tripsById from '../src/server/api/trips/[id].js'
import conversationsByTripId from '../src/server/api/conversations/[tripId].js'
import share from '../src/server/api/share.js'
import publicTrip from '../src/server/api/public-trip.js'
import downloadPdf from '../src/server/api/download-pdf.js'
import rates from '../src/server/api/rates.js'
import adminMetrics from '../src/server/api/admin/metrics.js'
import weatherRefresh from '../src/server/api/weather/refresh.js'

const exactRoutes = new Map([
  ['health', health],
  ['generate-itinerary', generateItinerary],
  ['generate-itinerary-stream', generateItineraryStream],
  ['refine-itinerary', refineItinerary],
  ['chat', chat],
  ['webhooks/clerk', clerkWebhook],
  ['sync-user', syncUser],
  ['trips', tripsIndex],
  ['trips/duplicate', tripsDuplicate],
  ['share', share],
  ['public-trip', publicTrip],
  ['download-pdf', downloadPdf],
  ['rates', rates],
  ['admin/metrics', adminMetrics],
  ['weather/refresh', weatherRefresh],
])

const patternRoutes = [
  {
    pattern: /^trips\/([^/]+)$/,
    params: (match) => ({ id: match[1] }),
    handler: tripsById,
  },
  {
    pattern: /^conversations\/([^/]+)$/,
    params: (match) => ({ tripId: match[1] }),
    handler: conversationsByTripId,
  },
]

function getRoutePath(req) {
  const pathParam = req.query?.path
  if (Array.isArray(pathParam)) {
    return pathParam.join('/').replace(/^\/+|\/+$/g, '')
  }
  if (typeof pathParam === 'string' && pathParam.trim()) {
    return pathParam.replace(/^\/+|\/+$/g, '')
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`)
  return url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
}

export default async function handler(req, res) {
  const routePath = getRoutePath(req)
  let routeHandler = exactRoutes.get(routePath)
  let params = {}

  if (!routeHandler) {
    for (const route of patternRoutes) {
      const match = routePath.match(route.pattern)
      if (!match) continue
      routeHandler = route.handler
      params = route.params(match)
      break
    }
  }

  if (!routeHandler) {
    return res.status(404).json({ error: `No handler for /api/${routePath}` })
  }

  req.query = { ...(req.query || {}), ...params }
  return routeHandler(req, res)
}

export const config = {
  maxDuration: 30,
}
