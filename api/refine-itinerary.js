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
  "days": [{ "title": "string", "activities": [{ "time": "HH:MM", "title": "string", "description": "string", "cost": number }] }],
  "budget": { "accommodation": number, "food": number, "activities": number, "transport": number },
  "hotels": ["string"],
  "packing": ["string"],
  "tips": ["string"]
}

Preserve unchanged days exactly as-is. Only modify what the user specifically asked about. ALL monetary values you return MUST be in US dollars (USD) — the client converts to local currency at display time. Real place names only. No markdown fences.

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

    // Persist updated itinerary and conversation turn in parallel
    await Promise.all([
      updateTripDays(tripId, user.id, updated.days),
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
    return res.status(200).json({ itinerary: updated })

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
