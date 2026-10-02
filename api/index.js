const health = () => import('../src/server/api/health.js')
const generateItinerary = () => import('../src/server/api/generate-itinerary.js')
const generateItineraryStream = () => import('../src/server/api/generate-itinerary-stream.js')
const refineItinerary = () => import('../src/server/api/refine-itinerary.js')
const chat = () => import('../src/server/api/chat.js')
const clerkWebhook = () => import('../src/server/api/webhooks/clerk.js')
const syncUser = () => import('../src/server/api/sync-user.js')
const tripsIndex = () => import('../src/server/api/trips/index.js')
const tripsDuplicate = () => import('../src/server/api/trips/duplicate.js')
const tripsById = () => import('../src/server/api/trips/[id].js')
const conversationsByTripId = () => import('../src/server/api/conversations/[tripId].js')
const share = () => import('../src/server/api/share.js')
const publicTrip = () => import('../src/server/api/public-trip.js')
const downloadPdf = () => import('../src/server/api/download-pdf.js')
const rates = () => import('../src/server/api/rates.js')
const adminMetrics = () => import('../src/server/api/admin/metrics.js')
const weatherRefresh = () => import('../src/server/api/weather/refresh.js')

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
  return url.pathname.replace(/^\/api\/?/, '').replace(/^\/+|\/+$/g, '')
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
  try {
    const { default: handleRoute } = await routeHandler()
    return await handleRoute(req, res)
  } catch (error) {
    console.error('[api route failure]', { route: routePath, code: error?.code, stack: error?.stack })
    if (res.headersSent) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'The API request failed. Check Vercel Runtime Logs.', code: error?.code || 'RouteError' })}\n\n`)
      return res.end()
    }
    return res.status(500).json({
      error: 'The API route could not run. Check Vercel Runtime Logs for the exception.',
      code: error?.code || 'RouteError',
      route: routePath,
    })
  }
}

export const config = {
  maxDuration: 60,
}
