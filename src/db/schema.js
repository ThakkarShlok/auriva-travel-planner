import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Users — synced from Clerk. The clerk_id is the source of truth for identity.
// We mirror minimal user info locally for join performance and to survive Clerk outages.
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

// TODO(phase-7b): Add trips, conversations, generations, weather_cache tables here
