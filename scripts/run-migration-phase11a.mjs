/**
 * Phase 11a migration: weather_refreshed_at on trips table.
 * Activity JSONB shape extended (contract only, no SQL column):
 *   actualCostUsdRate?: number    — USD→INR rate at moment actualCost was entered
 *   actualCostCapturedAt?: string — ISO timestamp of capture
 * Safe to re-run (IF NOT EXISTS / no-op UPDATE).
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDatabaseUrl } from './db-url.mjs'

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
} catch (e) {
  if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
    console.error('Cannot read .env.local:', e.message)
    process.exit(1)
  }
}

const { neon } = await import('@neondatabase/serverless')
const sql = neon(resolveDatabaseUrl())

console.log('Running Phase 11a migration...\n')

const stmts = [
  {
    label: 'ADD COLUMN weather_refreshed_at TIMESTAMPTZ',
    run: () => sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS weather_refreshed_at TIMESTAMPTZ`,
  },
]

for (const { label, run } of stmts) {
  await run()
  console.log('  ✓', label)
}

console.log('\nPhase 11a migration complete.\n')
console.log('Verifying column on trips table:')
const cols = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'trips'
    AND column_name = 'weather_refreshed_at'
`
for (const col of cols) {
  console.log(`  ✓ ${col.column_name} (${col.data_type})`)
}
if (cols.length === 0) {
  console.error('  ✗ weather_refreshed_at column not found — migration may have failed')
  process.exit(1)
}
