import { pgTable, text, timestamp, jsonb, integer, uuid, index } from 'drizzle-orm/pg-core'

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

// TODO(phase-8): Add weather_cache table here
// TODO(phase-8): Add generation_logs table here
