const CACHE = 'auriva-v1'
const APP_SHELL = ['/', '/index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Pass through non-GET requests unchanged
  if (e.request.method !== 'GET') return

  // Never cache admin, streaming, or refinement endpoints
  if (
    url.pathname.startsWith('/api/admin') ||
    url.pathname.includes('generate-itinerary-stream') ||
    url.pathname.includes('refine-itinerary')
  ) return

  // Network-first for trip API responses (cache for offline read)
  if (url.pathname.startsWith('/api/trips/') && !url.pathname.endsWith('/duplicate')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Cache-first for app shell and static assets
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  )
})
