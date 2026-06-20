import { db, generationLogs } from '../index.js'
import { desc, gte, sql } from 'drizzle-orm'

export async function logGeneration({
  userId, tripId, endpoint, model, status, errorMessage,
  promptTokens, completionTokens, totalTokens, latencyMs, contextEnrichments,
}) {
  try {
    await db.insert(generationLogs).values({
      userId: userId ?? null,
      tripId: tripId ?? null,
      endpoint,
      model,
      status,
      errorMessage: errorMessage ?? null,
      promptTokens: promptTokens ?? null,
      completionTokens: completionTokens ?? null,
      totalTokens: totalTokens ?? null,
      latencyMs: latencyMs ?? null,
      contextEnrichments: contextEnrichments ?? null,
    })
  } catch (err) {
    // Never let logging break the user-facing flow
    console.error('[generation log]', err.message)
  }
}

export async function getRecentGenerations(limit = 50) {
  return db.select().from(generationLogs).orderBy(desc(generationLogs.createdAt)).limit(limit)
}

export async function getMetricsSummary({ since }) {
  const sinceDate = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totals] = await db.select({
    total: sql`count(*)::int`,
    successes: sql`count(*) filter (where status = 'success')::int`,
    errors: sql`count(*) filter (where status = 'error')::int`,
    avgLatencyMs: sql`round(avg(latency_ms))::int`,
    totalTokens: sql`coalesce(sum(total_tokens), 0)::int`,
  }).from(generationLogs).where(gte(generationLogs.createdAt, sinceDate))

  return totals
}

export async function getDailyVolume({ days = 14 }) {
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const rows = await db.select({
    day: sql`date_trunc('day', created_at)::date`,
    count: sql`count(*)::int`,
    avgLatency: sql`round(avg(latency_ms))::int`,
  })
  .from(generationLogs)
  .where(gte(generationLogs.createdAt, sinceDate))
  .groupBy(sql`date_trunc('day', created_at)`)
  .orderBy(sql`date_trunc('day', created_at)`)
  return rows
}

export async function getEndpointBreakdown({ since }) {
  const sinceDate = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return db.select({
    endpoint: generationLogs.endpoint,
    count: sql`count(*)::int`,
    avgLatency: sql`round(avg(latency_ms))::int`,
    errorRate: sql`round((count(*) filter (where status = 'error') * 100.0 / count(*))::numeric, 1)`,
  })
  .from(generationLogs)
  .where(gte(generationLogs.createdAt, sinceDate))
  .groupBy(generationLogs.endpoint)
}
