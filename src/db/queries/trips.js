import { db, trips, tripDays, users } from '../index.js'
import { eq, desc, and } from 'drizzle-orm'

export async function getTripsForUser(userId) {
  return await db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.createdAt))
}

export async function getTripById(tripId, userId) {
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1)
  return trip ?? null
}

export async function getTripWithDays(tripId, userId) {
  const trip = await getTripById(tripId, userId)
  if (!trip) return null
  const days = await db
    .select()
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(tripDays.dayNumber)
  return { ...trip, days }
}

export async function createTrip({ userId, preferences, generated }) {
  const [trip] = await db.insert(trips).values({
    userId,
    destination: preferences.destination,
    duration: preferences.duration,
    travelers: preferences.travelers ?? 1,
    budget: preferences.budget,
    interests: preferences.interests ?? null,
    overview: generated.overview ?? null,
    budgetBreakdown: generated.budget ?? null,
    hotels: generated.hotels ?? null,
    packing: generated.packing ?? null,
    tips: generated.tips ?? null,
    weather: generated.weather ?? null,
    startDate: preferences.startDate ?? null,
  }).returning()

  if (Array.isArray(generated.days) && generated.days.length > 0) {
    await db.insert(tripDays).values(
      generated.days.map((day, idx) => ({
        tripId: trip.id,
        dayNumber: idx + 1,
        title: day.title ?? null,
        activities: day.activities ?? [],
      }))
    )
  }

  return trip
}

export async function updateTripDays(tripId, userId, daysData) {
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1)
  if (!trip) return null

  await db.delete(tripDays).where(eq(tripDays.tripId, tripId))

  if (Array.isArray(daysData) && daysData.length > 0) {
    await db.insert(tripDays).values(
      daysData.map((day, idx) => ({
        tripId,
        dayNumber: idx + 1,
        title: day.title ?? null,
        activities: day.activities ?? [],
      }))
    )
  }

  await db.update(trips)
    .set({ updatedAt: new Date() })
    .where(eq(trips.id, tripId))

  return trip
}

// Update a single day's activities and title (companion mode patch — no full-days rewrite).
export async function updateTripDay(tripId, userId, dayIndex, dayData) {
  const trip = await getTripById(tripId, userId)
  if (!trip) return null

  const dayNumber = dayIndex + 1
  const [existing] = await db.select()
    .from(tripDays)
    .where(and(eq(tripDays.tripId, tripId), eq(tripDays.dayNumber, dayNumber)))
    .limit(1)
  if (!existing) return null

  const [updated] = await db.update(tripDays)
    .set({
      title: dayData.title ?? existing.title,
      activities: dayData.activities ?? existing.activities,
    })
    .where(eq(tripDays.id, existing.id))
    .returning()

  await db.update(trips)
    .set({ updatedAt: new Date() })
    .where(eq(trips.id, tripId))

  return updated
}

// Persist the packing checklist (converted from static string array by user action).
export async function updateTripPackingChecklist(tripId, userId, checklist) {
  const [updated] = await db.update(trips)
    .set({ packingChecklist: checklist, updatedAt: new Date() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning()
  return updated ?? null
}

// Phase 11a: stamp the live-refresh time without touching the historical trips.weather JSONB.
export async function updateTripWeatherRefreshedAt(tripId, userId, refreshedAt = new Date()) {
  await db.update(trips)
    .set({ weatherRefreshedAt: refreshedAt })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
}

export async function updateTripMetadata(tripId, userId, { overview, budgetBreakdown, hotels, packing, tips }) {
  await db.update(trips)
    .set({ overview, budgetBreakdown, hotels, packing, tips, updatedAt: new Date() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
}

export async function deleteTrip(tripId, userId) {
  const result = await db
    .delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning({ id: trips.id })
  return result.length > 0
}

// ─── Sharing ──────────────────────────────────────────────────────────────────

function generateShareSlug() {
  // 10 chars, URL-safe, ~58 bits of entropy
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, b => b.toString(36)).join('').slice(0, 10)
}

export async function shareTrip(tripId, userId) {
  let slug
  for (let attempt = 0; attempt < 5; attempt++) {
    slug = generateShareSlug()
    const [existing] = await db.select({ id: trips.id })
      .from(trips)
      .where(eq(trips.shareSlug, slug))
      .limit(1)
    if (!existing) break
    if (attempt === 4) throw new Error('Could not generate unique share slug after 5 attempts')
  }

  const [updated] = await db.update(trips)
    .set({ shareSlug: slug, sharedAt: new Date() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning()

  return updated ?? null
}

export async function unshareTrip(tripId, userId) {
  const [updated] = await db.update(trips)
    .set({ shareSlug: null, sharedAt: null })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning()
  return updated ?? null
}

export async function getPublicTripBySlug(slug) {
  const [trip] = await db.select()
    .from(trips)
    .where(eq(trips.shareSlug, slug))
    .limit(1)

  if (!trip) return null

  const days = await db.select()
    .from(tripDays)
    .where(eq(tripDays.tripId, trip.id))
    .orderBy(tripDays.dayNumber)

  return { ...trip, days }
}

export async function duplicateTrip(tripId, userId) {
  const existing = await getTripWithDays(tripId, userId)
  if (!existing) return null

  const [newTrip] = await db.insert(trips).values({
    userId,
    destination: `${existing.destination} (copy)`,
    duration: existing.duration,
    travelers: existing.travelers,
    budget: existing.budget,
    interests: existing.interests,
    overview: existing.overview,
    budgetBreakdown: existing.budgetBreakdown,
    hotels: existing.hotels,
    packing: existing.packing,
    tips: existing.tips,
  }).returning()

  if (existing.days?.length > 0) {
    await db.insert(tripDays).values(
      existing.days.map((day) => ({
        tripId: newTrip.id,
        dayNumber: day.dayNumber,
        title: day.title,
        activities: day.activities,
      }))
    )
  }

  return newTrip
}
