import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function loadEnvLocal() {
  try {
    const text = await readFile(resolve(__dirname, '.env.local'), 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && !(key in process.env)) process.env[key] = val
    }
  } catch {}
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function sendJson(res, status, data) {
  if (res.headersSent) return
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function wrapRes(res) {
  return {
    get headersSent() { return res.headersSent },
    status(code) { res.statusCode = code; return this },
    json(data) { sendJson(res, res.statusCode || 200, data); return this },
    send(body) {
      if (!res.headersSent) res.end(typeof body === 'string' ? body : JSON.stringify(body))
      return this
    },
    setHeader(k, v) { res.setHeader(k, v); return this },
    // SSE / streaming support
    writeHead(status, headers) { res.writeHead(status, headers); return this },
    write(chunk) { res.write(chunk); return this },
    end(data) { res.end(data); return this },
  }
}

function apiPlugin() {
  const exactRoutes = {}
  const patternRoutes = [] // [{ regex, paramNames, handler }] — tried in registration order

  return {
    name: 'local-api',
    async configureServer(server) {
      await loadEnvLocal()

      const apiRoutes = [
        // Exact routes — registered first, matched first
        { route: 'health',                    file: 'health' },
        { route: 'generate-itinerary',        file: 'generate-itinerary' },
        { route: 'generate-itinerary-stream', file: 'generate-itinerary-stream' },
        { route: 'refine-itinerary',          file: 'refine-itinerary' },
        { route: 'chat',                      file: 'chat' },
        { route: 'webhooks/clerk',            file: 'webhooks/clerk' },
        { route: 'sync-user',                 file: 'sync-user' },
        // Trips — exact before pattern so /trips/duplicate is not captured by /trips/:id
        { route: 'trips',                     file: 'trips/index' },
        { route: 'trips/duplicate',           file: 'trips/duplicate' },
        { route: 'trips/:id',                 file: 'trips/[id]' },
        // Conversations
        { route: 'conversations/:tripId',     file: 'conversations/[tripId]' },
        // Sharing — exact routes (slug passed as query param, not URL segment)
        { route: 'share',                     file: 'share' },
        { route: 'public-trip',               file: 'public-trip' },
        // PDF download — exact route (email is now client-side via EmailJS)
        { route: 'download-pdf',              file: 'download-pdf' },
        // Real-world context (Phase 8) — currency rates + admin observability
        { route: 'rates',                     file: 'rates' },
        { route: 'admin/metrics',             file: 'admin/metrics' },
      ]

      for (const { route, file } of apiRoutes) {
        try {
          const mod = await import(pathToFileURL(resolve(__dirname, `api/${file}.js`)).href)
          const routePath = `/api/${route}`
          if (route.includes(':')) {
            // Dynamic route — build a regex from :param segments
            const paramNames = []
            const regexStr = routePath.replace(/:([^/]+)/g, (_, name) => {
              paramNames.push(name)
              return '([^/]+)'
            })
            patternRoutes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler: mod.default })
          } else {
            exactRoutes[routePath] = mod.default
          }
          console.log(`  \x1b[32m✓\x1b[0m /api/${route}`)
        } catch (err) {
          console.error(`  \x1b[31m✗\x1b[0m /api/${route}: ${err.message}`)
        }
      }

      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0].replace(/\/$/, '') || '/'
        if (!pathname.startsWith('/api/')) return next()

        // CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          })
          res.end()
          return
        }

        // IIFE + .catch so unhandled async errors always produce a JSON response
        ;(async () => {
          const bodyBuf = await readBody(req)
          let body = {}
          try { if (bodyBuf.length) body = JSON.parse(bodyBuf.toString()) } catch {}

          const url = new URL(req.url, 'http://localhost')
          let baseQuery = Object.fromEntries(url.searchParams)

          // 1. Exact match
          let handler = exactRoutes[pathname]
          let query = baseQuery

          // 2. Pattern match (tried in registration order — exact-before-pattern ordering above handles priority)
          if (!handler) {
            for (const { regex, paramNames, handler: h } of patternRoutes) {
              const match = pathname.match(regex)
              if (match) {
                handler = h
                const params = {}
                paramNames.forEach((name, i) => { params[name] = match[i + 1] })
                query = { ...baseQuery, ...params }
                break
              }
            }
          }

          if (!handler) {
            sendJson(res, 404, { error: `No handler for ${pathname}` })
            return
          }

          const vReq = Object.assign(req, {
            query,
            body,
            rawBody: bodyBuf.toString(),
            cookies: {},
          })

          await handler(vReq, wrapRes(res))
        })().catch(err => {
          console.error(`[api] ${pathname}:`, err.message)
          if (res.headersSent) {
            try { res.end() } catch {}
          } else {
            sendJson(res, 500, { error: err.message })
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
})
