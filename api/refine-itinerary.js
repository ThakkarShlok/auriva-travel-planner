import { callGroq } from './_lib/groq.js'
import { requireUser, AuthError } from './_lib/auth.js'
import { getTripWithDays, updateTripDays, updateTripMetadata } from '../src/db/queries/trips.js'
import { appendMessage } from '../src/db/queries/conversations.js'
import { buildWeatherPromptContext } from './_lib/weather.js'
import { logGeneration } from '../src/db/queries/generationLogs.js'

const MODEL = 'llama-3.3-70b-versatile'

const REFINE_SYSTEM_PROMPT = `You are an expert travel planner refining an existing itinerary based on user feedback. You will be given the current itinerary as JSON and the user's modification request.

Return ONLY a JSON object with the FULL updated itinerary in this exact schema:
{
  "overview": "string",
  "days": [{ "title": "string", "activities": [{ "time": "HH:MM", "title": "string", "description": "string", "cost": number, "lat": number | null, "lng": number | null }] }],
  "budget": { "accommodation": number, "food": number, "activities": number, "transport": number },
  "hotels": ["string"],
  "packing": ["string"],
  "tips": ["string"]
}

Preserve unchanged days exactly as-is — including the "lat" and "lng" values from the current itinerary. For any NEW activities you add, include approximate WGS-84 coordinates if the venue is a known fixed location; otherwise set to null. ALL monetary values MUST be in US dollars (USD). Real place names only. No markdown fences.

If a weather forecast is included below, keep activity timing and packing list aligned with it unless the user's request overrides it.`

export default async function handler(req, res) {
  const startTime = Date.now()
  let user = null
  let weatherUsed = false
  let tripIdForLog = null
  try {
    user = await requireUser(req)

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { tripId, instruction } = req.body ?? {}
    tripIdForLog = tripId ?? null

    if (!tripId) {
      return res.status(400).json({ error: 'tripId is required' })
    }
    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return res.status(400).json({ error: 'instruction is required' })
    }
    if (instruction.length > 1000) {
      return res.status(400).json({ error: 'instruction too long (max 1000 chars)' })
    }

    // Load trip from DB — confirms ownership and provides current state for AI context
    const trip = await getTripWithDays(tripId, user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const currentItinerary = {
      overview: trip.overview,
      days: trip.days.map(d => ({ title: d.title, activities: d.activities })),
      budget: trip.budgetBreakdown,
      hotels: trip.hotels,
      packing: trip.packing,
      tips: trip.tips,
    }

    // Reuse the trip's stored forecast (destination hasn't changed) — no extra API call
    const weatherContext = trip.weather
      ? buildWeatherPromptContext({ forecast: trip.weather }, null, trip.duration)
      : null
    weatherUsed = !!weatherContext
    const systemPromptWithContext = weatherContext
      ? `${REFINE_SYSTEM_PROMPT}\n\nWeather forecast:\n${weatherContext}`
      : REFINE_SYSTEM_PROMPT

    const userPrompt = `Current itinerary:\n${JSON.stringify(currentItinerary)}\n\nDestination: ${trip.destination}, ${trip.duration} days.\n\nUser request: ${instruction.trim()}\n\nReturn the full updated itinerary as JSON.`

    const content = await callGroq({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPromptWithContext },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      responseFormat: { type: 'json_object' },
      timeoutMs: 30000,
    })

    let updated
    try {
      updated = JSON.parse(content)
    } catch {
      logGeneration({
        userId: user.id, tripId: tripIdForLog, endpoint: 'refine-itinerary', model: MODEL,
        status: 'error', errorMessage: 'AI returned malformed JSON',
        latencyMs: Date.now() - startTime,
        contextEnrichments: { weather: weatherUsed, currency: 'USD' },
      })
      return res.status(502).json({ error: 'AI returned malformed JSON' })
    }

    // Merge coordinates + companion fields from the existing DB activities into what Groq returned.
    // Groq only returns the schema fields (time/title/description/cost/lat/lng).
    // lat/lng may be null if Groq omitted them for unchanged activities — fall back to DB values.
    // checked/notes/actualCost are never returned by Groq — always restored from DB.
    const mergedDays = (updated.days ?? []).map((day, dayIdx) => {
      const prevDay = trip.days?.[dayIdx]
      return {
        ...day,
        activities: (day.activities ?? []).map((act, actIdx) => {
          const prevAct = prevDay?.activities?.[actIdx]
          const merged = {
            ...act,
            lat: act.lat ?? prevAct?.lat ?? null,
            lng: act.lng ?? prevAct?.lng ?? null,
          }
          if (prevAct?.checked !== undefined) merged.checked = prevAct.checked
          if (prevAct?.notes !== undefined) merged.notes = prevAct.notes
          if (prevAct?.actualCost !== undefined) merged.actualCost = prevAct.actualCost
          if (prevAct?.actualCostUsdRate !== undefined) merged.actualCostUsdRate = prevAct.actualCostUsdRate
          if (prevAct?.actualCostCapturedAt !== undefined) merged.actualCostCapturedAt = prevAct.actualCostCapturedAt
          return merged
        }),
      }
    })

    // Persist updated itinerary and conversation turn in parallel
    await Promise.all([
      updateTripDays(tripId, user.id, mergedDays),
      updateTripMetadata(tripId, user.id, {
        overview: updated.overview,
        budgetBreakdown: updated.budget,
        hotels: updated.hotels,
        packing: updated.packing,
        tips: updated.tips,
      }),
      appendMessage({ tripId, userId: user.id, role: 'user', content: instruction.trim() }),
      appendMessage({
        tripId,
        userId: user.id,
        role: 'assistant',
        content: `Updated itinerary: "${instruction.trim().slice(0, 100)}"`,
      }),
    ])

    console.log('[api] /api/refine-itinerary success — trip', tripId)
    logGeneration({
      userId: user.id, tripId: tripIdForLog, endpoint: 'refine-itinerary', model: MODEL,
      status: 'success',
      latencyMs: Date.now() - startTime,
      contextEnrichments: { weather: weatherUsed, currency: 'USD' },
    })
    // Return mergedDays so the frontend state matches what was saved to DB
    return res.status(200).json({ itinerary: { ...updated, days: mergedDays } })

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message, code: 'AuthError' })
    }
    console.error('[api error refine]', error?.name, error?.message)
    logGeneration({
      userId: user?.id ?? null, tripId: tripIdForLog, endpoint: 'refine-itinerary', model: MODEL,
      status: 'error', errorMessage: error?.message?.slice(0, 500),
      latencyMs: Date.now() - startTime,
      contextEnrichments: { weather: weatherUsed, currency: 'USD' },
    })
    return res.status(error?.status || 500).json({
      error: error?.message || 'Unknown server error',
      code: error?.code || 'UnknownError',
    })
  }
}

export const config = { maxDuration: 60 }
