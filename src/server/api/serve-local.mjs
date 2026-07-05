/**
 * Local dev API server — run this instead of `vercel dev` on Windows.
 *
 * Usage:
 *   node src/server/api/serve-local.mjs
 *
 * Serves all /api/* functions on http://localhost:3001 so that `npm run dev`
 * (Vite) can proxy /api requests to it (see vite.config.js proxy setting).
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = 3001

// ── Load .env.local (simple line parser, no dependencies) ─────────────────
async function loadEnv() {
  const envPath = resolve(__dirname, '..', '..', '..', '.env.local')
  try {
    const text = await readFile(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && !(key in process.env)) process.env[key] = val
    }
    console.log('[api-server] loaded .env.local')
  } catch {
    console.log('[api-server] no .env.local found, using existing env')
  }
}

// ── Helper: create a minimal req/res adapter ─────────────────────────────
function makeVercelReqRes(req, res, bodyBuffer) {
  // Attach helpers the vercel handlers expect
  const url = new URL(req.url, `http://localhost:${PORT}`)

  const vReq = Object.assign(req, {
    query: Object.fromEntries(url.searchParams),
    body: (() => {
      try { return JSON.parse(bodyBuffer.toString()) } catch { return {} }
    })(),
    cookies: {},
  })

  const vRes = Object.assign(res, {
    status(code) { res.statusCode = code; return vRes },
    json(data) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }
      return vRes
    },
    send(body) {
      if (!res.headersSent) res.end(typeof body === 'string' ? body : JSON.stringify(body))
      return vRes
    },
    setHeader: res.setHeader.bind(res),
  })

  return { vReq, vRes }
}

// ── Route table ──────────────────────────────────────────────────────────
const routes = {}

async function loadRoutes() {
  const handlers = ['health', 'generate-itinerary', 'chat']
  for (const name of handlers) {
    try {
      const mod = await import(`./${name}.js?t=${Date.now()}`)
      routes[`/api/${name}`] = mod.default
      console.log(`[api-server] loaded /api/${name}`)
    } catch (err) {
      console.error(`[api-server] failed to load /api/${name}:`, err.message)
    }
  }
}

// ── HTTP server ──────────────────────────────────────────────────────────
await loadEnv()
await loadRoutes()

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  const handler = routes[pathname]

  if (!handler) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: `No handler for ${pathname}` }))
    return
  }

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', async () => {
    const body = Buffer.concat(chunks)
    const { vReq, vRes } = makeVercelReqRes(req, res, body)
    try {
      await handler(vReq, vRes)
    } catch (err) {
      console.error('[api-server] handler threw:', err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message }))
      }
    }
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[api-server] listening on http://localhost:${PORT}`)
  console.log('[api-server] routes:', Object.keys(routes).join(', '))
})
