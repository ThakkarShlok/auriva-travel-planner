/**
 * Phase 9 migration: start_date + packing_checklist on trips table.
 * Safe to re-run (all statements are IF NOT EXISTS).
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

console.log('Running Phase 9 migration...\n')

// Each statement as a tagged template with no interpolations — safe for DDL
const stmts = [
  { label: 'ADD COLUMN start_date DATE', run: () => sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_date DATE` },
  { label: 'ADD COLUMN packing_checklist JSONB', run: () => sql`ALTER TABLE trips ADD COLUMN IF NOT EXISTS packing_checklist JSONB` },
  { label: 'CREATE INDEX trips_start_date_idx', run: () => sql`CREATE INDEX IF NOT EXISTS trips_start_date_idx ON trips (start_date)` },
]

for (const { label, run } of stmts) {
  await run()
  console.log('  ✓', label)
}

console.log('\nPhase 9 migration complete.\n')
console.log('Verifying columns on trips table:')
const cols = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'trips'
    AND column_name IN ('start_date', 'packing_checklist')
  ORDER BY column_name
`
for (const col of cols) {
  console.log(`  ✓ ${col.column_name} (${col.data_type})`)
}
