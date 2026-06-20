/**
 * One-off backfill: populate `weather` for existing trips that have none,
 * now that the geocoding fallback chain (Open-Meteo -> Nominatim) is in place.
 * Safe to re-run — only touches rows where weather IS NULL.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const text = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
} catch (e) { console.error('Cannot read .env.local:', e.message); process.exit(1) }

const { neon } = await import('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

const { getWeatherForDestination } = await import('../api/_lib/weather.js')

const rows = await sql`SELECT id, destination FROM trips WHERE weather IS NULL ORDER BY created_at DESC`
console.log(`Found ${rows.length} trips with no weather data.\n`)

for (const row of rows) {
  const weatherData = await getWeatherForDestination(row.destination)
  if (!weatherData) {
    console.log(`  - skip "${row.destination}" (${row.id}): still unresolvable`)
    continue
  }
  await sql`UPDATE trips SET weather = ${JSON.stringify(weatherData.forecast)}::jsonb WHERE id = ${row.id}`
  console.log(`  + backfilled "${row.destination}" (${row.id}) -> ${weatherData.forecast.placeName}, ${weatherData.forecast.country}`)
}

console.log('\nDone.')
