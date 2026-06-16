/**
 * Phase 7B migration — creates trips, trip_days, conversation_messages tables.
 * Uses drizzle db.execute(sql.raw(...)) which works with the neon-http driver.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
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
  `CREATE TABLE IF NOT EXISTS "trips" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "destination" text NOT NULL,
    "duration" integer NOT NULL,
    "travelers" integer DEFAULT 1 NOT NULL,
    "budget" text NOT NULL,
    "interests" text,
    "overview" text,
    "budget_breakdown" jsonb,
    "hotels" jsonb,
    "packing" jsonb,
    "tips" jsonb,
    "share_slug" text,
    "shared_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "trips_share_slug_unique" UNIQUE("share_slug")
  )`,

  `CREATE TABLE IF NOT EXISTS "trip_days" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" uuid NOT NULL,
    "day_number" integer NOT NULL,
    "title" text,
    "activities" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "conversation_messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `DO $$ BEGIN
    ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    ALTER TABLE "trip_days" ADD CONSTRAINT "trip_days_trip_id_trips_id_fk"
      FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_trip_id_trips_id_fk"
      FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE INDEX IF NOT EXISTS "trips_user_id_idx" ON "trips" USING btree ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "trips_share_slug_idx" ON "trips" USING btree ("share_slug")`,
  `CREATE INDEX IF NOT EXISTS "trip_days_trip_id_idx" ON "trip_days" USING btree ("trip_id")`,
  `CREATE INDEX IF NOT EXISTS "conversation_messages_trip_id_idx" ON "conversation_messages" USING btree ("trip_id")`,
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
console.log('\n✅ Migration complete.')
