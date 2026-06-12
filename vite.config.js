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
  const routes = {}

  return {
    name: 'local-api',
    async configureServer(server) {
      await loadEnvLocal()

      const apiRoutes = [
        { route: 'health',                    file: 'health' },
        { route: 'generate-itinerary',        file: 'generate-itinerary' },
        { route: 'generate-itinerary-stream', file: 'generate-itinerary-stream' },
        { route: 'refine-itinerary',          file: 'refine-itinerary' },
        { route: 'chat',                      file: 'chat' },
        { route: 'webhooks/clerk',            file: 'webhooks/clerk' },
        { route: 'sync-user',               file: 'sync-user' },
      ]
      for (const { route, file } of apiRoutes) {
        try {
          const mod = await import(pathToFileURL(resolve(__dirname, `api/${file}.js`)).href)
          routes[`/api/${route}`] = mod.default
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
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end()
          return
        }

        const handler = routes[pathname]
        if (!handler) {
          sendJson(res, 404, { error: `No handler for ${pathname}` })
          return
        }

        // IIFE + .catch so unhandled async errors always produce a JSON response
        ;(async () => {
          const bodyBuf = await readBody(req)
          let body = {}
          try { if (bodyBuf.length) body = JSON.parse(bodyBuf.toString()) } catch {}

          const url = new URL(req.url, 'http://localhost')
          const vReq = Object.assign(req, {
            query: Object.fromEntries(url.searchParams),
            body,
            rawBody: bodyBuf.toString(), // raw payload string for webhook signature verification
            cookies: {},
          })

          await handler(vReq, wrapRes(res))
        })().catch(err => {
          console.error(`[api] ${pathname}:`, err.message)
          if (res.headersSent) {
            // Streaming response already started — close it cleanly
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
