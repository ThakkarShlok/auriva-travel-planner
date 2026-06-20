import { db, exchangeRates } from '../index.js'
import { eq, and, desc } from 'drizzle-orm'

const RATE_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours

export async function getCachedRate(base, target) {
  const [row] = await db.select()
    .from(exchangeRates)
    .where(and(eq(exchangeRates.baseCurrency, base), eq(exchangeRates.targetCurrency, target)))
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1)
  if (!row) return null

  const age = Date.now() - new Date(row.fetchedAt).getTime()
  if (age > RATE_TTL_MS) return null

  return row.rate
}

export async function upsertRate({ base, target, rate }) {
  await db.insert(exchangeRates).values({
    baseCurrency: base,
    targetCurrency: target,
    rate,
    fetchedAt: new Date(),
  })
  // History is kept intentionally — "latest" lookup uses ORDER BY DESC LIMIT 1.
}
