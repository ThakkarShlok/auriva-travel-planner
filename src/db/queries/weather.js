import { db, weatherCache } from '../index.js'
import { eq } from 'drizzle-orm'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000  // 6 hours

function normalizeKey(destination) {
  return destination.trim().toLowerCase()
}

export async function getCachedWeather(destination) {
  const key = normalizeKey(destination)
  const [row] = await db.select().from(weatherCache).where(eq(weatherCache.destinationKey, key)).limit(1)
  if (!row) return null

  const age = Date.now() - new Date(row.fetchedAt).getTime()
  if (age > CACHE_TTL_MS) return null

  return row
}

export async function upsertWeather({ destination, latitude, longitude, forecast }) {
  const key = normalizeKey(destination)
  await db.insert(weatherCache).values({
    destinationKey: key,
    latitude,
    longitude,
    forecast,
    fetchedAt: new Date(),
  }).onConflictDoUpdate({
    target: weatherCache.destinationKey,
    set: {
      latitude,
      longitude,
      forecast,
      fetchedAt: new Date(),
    },
  })
}
