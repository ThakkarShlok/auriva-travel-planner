/**
 * Phase 8 migration — creates weather_cache, exchange_rates, generation_logs
 * tables and adds the weather column to trips.
 * Uses drizzle db.execute(sql.raw(...)) which works with the neon-http driver.
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

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env.local'); process.exit(1)
}

const { neon }    = await import('@neondatabase/serverless')
const { drizzle } = await import('drizzle-orm/neon-http')
const { sql }     = await import('drizzle-orm')

const db = drizzle(neon(process.env.DATABASE_URL))

const statements = [
  `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "weather" jsonb`,

  `CREATE TABLE IF NOT EXISTS "weather_cache" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "destination_key" text NOT NULL,
    "latitude" real NOT NULL,
    "longitude" real NOT NULL,
    "forecast" jsonb NOT NULL,
    "fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "weather_cache_destination_key_unique" UNIQUE("destination_key")
  )`,

  `CREATE TABLE IF NOT EXISTS "exchange_rates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "base_currency" text NOT NULL,
    "target_currency" text NOT NULL,
    "rate" real NOT NULL,
    "fetched_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "generation_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "trip_id" uuid,
    "endpoint" text NOT NULL,
    "model" text NOT NULL,
    "status" text NOT NULL,
    "error_message" text,
    "prompt_tokens" integer,
    "completion_tokens" integer,
    "total_tokens" integer,
    "latency_ms" integer,
    "context_enrichments" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `DO $$ BEGIN
    ALTER TABLE "generation_logs" ADD CONSTRAINT "generation_logs_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    ALTER TABLE "generation_logs" ADD CONSTRAINT "generation_logs_trip_id_trips_id_fk"
      FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE INDEX IF NOT EXISTS "weather_cache_destination_key_idx" ON "weather_cache" USING btree ("destination_key")`,
  `CREATE INDEX IF NOT EXISTS "exchange_rates_pair_idx" ON "exchange_rates" USING btree ("base_currency","target_currency")`,
  `CREATE INDEX IF NOT EXISTS "generation_logs_user_id_idx" ON "generation_logs" USING btree ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "generation_logs_created_at_idx" ON "generation_logs" USING btree ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "generation_logs_endpoint_idx" ON "generation_logs" USING btree ("endpoint")`,
]

console.log(`Running ${statements.length} statements against Neon…\n`)

for (let i = 0; i < statements.length; i++) {
  const preview = statements[i].trim().slice(0, 70).replace(/\s+/g, ' ')
  try {
    await db.execute(sql.raw(statements[i]))
    console.log(`  ✓ [${i + 1}/${statements.length}] ${preview}…`)
  } catch (err) {
    console.error(`  ✗ [${i + 1}/${statements.length}] FAILED: ${err.message}`)
    console.error('  Full statement:', statements[i])
    process.exit(1)
  }
}

console.log('\nVerifying tables…')
const { neon: neon2 } = await import('@neondatabase/serverless')
const verify = neon2(process.env.DATABASE_URL)
const rows = await verify`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name`
console.log('Tables now in DB:', rows.map(r => r.table_name).join(', '))

const cols = await verify`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'trips' ORDER BY column_name`
console.log('trips columns:', cols.map(r => r.column_name).join(', '))

console.log('\n✅ Phase 8 migration complete.')
