import { getCachedRate, upsertRate } from '../src/db/queries/rates.js'

const RATE_API = 'https://open.er-api.com/v6/latest/USD'

async function fetchFreshRates() {
  const res = await fetch(RATE_API)
  if (!res.ok) throw new Error(`Rate API ${res.status}`)
  const data = await res.json()
  if (!data?.rates) throw new Error('Malformed rate response')
  return data.rates
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    let inrRate = await getCachedRate('USD', 'INR')

    if (!inrRate) {
      try {
        const rates = await fetchFreshRates()
        if (rates.INR) {
          inrRate = rates.INR
          upsertRate({ base: 'USD', target: 'INR', rate: inrRate })
            .catch(err => console.error('[rate cache]', err.message))
        }
      } catch (err) {
        console.error('[rates]', err.message)
        inrRate = 83.5  // Fallback so the app never breaks
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.status(200).json({
      base: 'USD',
      rates: { INR: inrRate },
      fetchedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[api rates]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
