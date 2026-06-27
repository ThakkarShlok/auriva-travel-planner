import { pgTable, text, timestamp, jsonb, integer, real, uuid, index, date } from 'drizzle-orm/pg-core'

/**
 * @typedef {object} Activity
 * @property {string} time        - HH:MM
 * @property {string} title
 * @property {string} description
 * @property {number} cost        - Estimated cost in USD (from Groq, never changed)
 * @property {string} [category]
 * @property {number} [lat]              - Phase 11a: approximate latitude (from Groq)
 * @property {number} [lng]              - Phase 11a: approximate longitude (from Groq)
 * @property {boolean} [checked]         - Phase 9: did the user do this activity?
 * @property {string}  [notes]           - Phase 9: user's personal notes
 * @property {number}  [actualCost]      - Phase 9: what the user actually spent (USD)
 * @property {number}  [actualCostUsdRate]    - Phase 11a: USD→INR rate captured at entry time
 * @property {string}  [actualCostCapturedAt] - Phase 11a: ISO timestamp of capture
 */

// Users — synced from Clerk. The clerk_id is the source of truth for identity.
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Trips — top-level container for a generated itinerary.
export const trips = pgTable('trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  destination: text('destination').notNull(),
  duration: integer('duration').notNull(),
  travelers: integer('travelers').notNull().default(1),
  budget: text('budget').notNull(),           // 'budget' | 'moderate' | 'luxury'
  interests: text('interests'),
  overview: text('overview'),
  budgetBreakdown: jsonb('budget_breakdown'), // { accommodation, food, activities, transport }
  hotels: jsonb('hotels'),                    // string[]
  packing: jsonb('packing'),                  // string[]
  tips: jsonb('tips'),                        // string[]
  shareSlug: text('share_slug').unique(),     // TODO(phase-7c): public share link
  sharedAt: timestamp('shared_at', { withTimezone: true }),
  weather: jsonb('weather'),                  // { timezone, placeName, country, daily: [...] } at generation time
  startDate: date('start_date'),              // Phase 9: YYYY-MM-DD, user-provided trip start date
  packingChecklist: jsonb('packing_checklist'), // Phase 9: [{item: string, checked: boolean}] after user saves
  weatherRefreshedAt: timestamp('weather_refreshed_at', { withTimezone: true }), // Phase 11a: last live refresh time
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('trips_user_id_idx').on(table.userId),
  shareSlugIdx: index('trips_share_slug_idx').on(table.shareSlug),
}))

// Trip days — first-class rows so a single day can be updated without rewriting the whole trip.
// Activities within a day stay as JSONB (read together, never individually queried).
export const tripDays = pgTable('trip_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  title: text('title'),
  activities: jsonb('activities').notNull().default([]), // [{ time, title, description, cost }]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdx: index('trip_days_trip_id_idx').on(table.tripId),
}))

// Conversation messages — flat per-trip log of refinement turns.
export const conversationMessages = pgTable('conversation_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),     // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripIdx: index('conversation_messages_trip_id_idx').on(table.tripId),
}))

// Weather forecasts cached by destination, 6-hour TTL via app-level check
export const weatherCache = pgTable('weather_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Cache key: lowercased destination string. We accept some duplication
  // (e.g. "Tokyo" and "tokyo, japan") in exchange for simpler lookup.
  destinationKey: text('destination_key').notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  // Full forecast JSON from Open-Meteo, normalized for our use
  forecast: jsonb('forecast').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  destinationKeyIdx: index('weather_cache_destination_key_idx').on(table.destinationKey),
}))

// Exchange rates cached, ~24-hour TTL since FX moves slowly day-to-day
export const exchangeRates = pgTable('exchange_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  baseCurrency: text('base_currency').notNull(),  // 'USD'
  targetCurrency: text('target_currency').notNull(),  // 'INR'
  rate: real('rate').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  baseTargetIdx: index('exchange_rates_pair_idx').on(table.baseCurrency, table.targetCurrency),
}))

// Generation observability — one row per Groq call
export const generationLogs = pgTable('generation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),  // nullable for anonymous calls
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'set null' }),  // nullable: errors happen before trip exists
  endpoint: text('endpoint').notNull(),  // 'generate-itinerary-stream' | 'refine-itinerary' | 'chat'
  model: text('model').notNull(),
  status: text('status').notNull(),  // 'success' | 'error' | 'timeout'
  errorMessage: text('error_message'),  // populated on error
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  latencyMs: integer('latency_ms'),
  contextEnrichments: jsonb('context_enrichments'),  // { weather: true|false, currency: 'USD', ... }
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('generation_logs_user_id_idx').on(table.userId),
  createdAtIdx: index('generation_logs_created_at_idx').on(table.createdAt),
  endpointIdx: index('generation_logs_endpoint_idx').on(table.endpoint),
}))
