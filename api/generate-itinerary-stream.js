import { assertGroqKey } from './_lib/groq.js'
import { getWeatherForDestination, buildWeatherPromptContext } from './_lib/weather.js'
import { logGeneration } from '../src/db/queries/generationLogs.js'

const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are an expert travel planner. Respond with a JSON object only, no markdown fences. Use this exact schema:
{
  "overview": "string — 2-3 sentence trip summary",
  "days": [{ "title": "string", "activities": [{ "time": "HH:MM", "title": "string", "description": "string", "cost": number, "lat": number | null, "lng": number | null }] }],
  "budget": { "accommodation": number, "food": number, "activities": number, "transport": number },
  "hotels": ["string"],
  "packing": ["string"],
  "tips": ["string"]
}
ALL monetary values you return MUST be in US dollars (USD). The client converts to local currency at display time. Do not adjust prices for the destination's local currency.
For each activity, include "lat" and "lng" with approximate WGS-84 coordinates of the specific venue or attraction if known. Set to null for hotel stays, meals at unspecified restaurants, or any activity with no clear fixed location. Use real hotel names, real restaurant names, real landmarks — never invent placeholder names.

If the user message includes a weather forecast, USE IT to:
- Suggest indoor activities or alternatives on rainy days (>60% precipitation)
- Adjust outdoor activity timing for hot days (>30°C: avoid midday)
- Adjust outdoor activity timing for cold days (<10°C: prefer mid-day for warmth)
- Tailor the packing list to expected conditions (rain jackets, layers, etc.)
- Include weather-aware tips in the tips array

Do not invent weather data. Only use forecast information explicitly provided in the prompt.`

export default async function handler(req, res) {
  const startTime = Date.now()
  let weatherData = null

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed', code: 'MethodNotAllowed' })
    }

    const apiKey = assertGroqKey()

    const { destination, duration, budget, travelers, interests, startDate } = req.body ?? {}

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ error: 'destination is required', code: 'ValidationError' })
    }
    const days = Number(duration)
    if (!days || days < 1 || days > 30) {
      return res.status(400).json({ error: 'duration must be a number between 1 and 30', code: 'ValidationError' })
    }

    // Real-world context — enrichment only, never blocks generation on failure
    weatherData = await getWeatherForDestination(destination.trim())
    const weatherContext = buildWeatherPromptContext(weatherData, null, days)
    const systemPromptWithContext = weatherContext
      ? `${SYSTEM_PROMPT}\n\nIMPORTANT CONTEXT:\n${weatherContext}`
      : SYSTEM_PROMPT

    const userPrompt = `Create a ${days}-day travel itinerary for ${destination.trim()}.
Budget level: ${budget || 'moderate'}. Travelers: ${travelers || 2}.
${startDate ? `Trip starts: ${startDate}. ` : ''}Interests: ${interests || 'sightseeing, local food, culture'}.
Include ${days} days of activities with specific real place names.`

    // Commit to SSE response — no JSON responses after this point
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    sendEvent('status', { message: 'starting' })
    // Include lat/lng alongside the forecast so the detail page can refresh live weather later.
    // Consumers that only need trip.weather.daily are unaffected — daily is still at top level.
    sendEvent('weather', weatherData
      ? { ...weatherData.forecast, latitude: weatherData.latitude, longitude: weatherData.longitude }
      : null
    )

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPromptWithContext },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
      }),
    })

    if (!upstream.ok || !upstream.body) {
      const errBody = await upstream.text().catch(() => '')
      sendEvent('error', { error: `Groq API ${upstream.status}: ${errBody.slice(0, 300)}` })
      logGeneration({
        endpoint: 'generate-itinerary-stream',
        model: MODEL,
        status: 'error',
        errorMessage: `Groq API ${upstream.status}: ${errBody.slice(0, 300)}`,
        latencyMs: Date.now() - startTime,
        contextEnrichments: { weather: !!weatherData, weatherCached: weatherData?.cached ?? null, currency: 'USD' },
      })
      res.end()
      return
    }

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })

      const lines = buf.split('\n')
      buf = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) sendEvent('token', { content: delta })
        } catch {
          // skip malformed SSE line from Groq
        }
      }
    }

    sendEvent('done', { ok: true })
    res.end()

    logGeneration({
      endpoint: 'generate-itinerary-stream',
      model: MODEL,
      status: 'success',
      latencyMs: Date.now() - startTime,
      contextEnrichments: { weather: !!weatherData, weatherCached: weatherData?.cached ?? null, currency: 'USD' },
    })

  } catch (error) {
    console.error('[api stream error]', error?.name, error?.message)
    logGeneration({
      endpoint: 'generate-itinerary-stream',
      model: MODEL,
      status: 'error',
      errorMessage: error?.message?.slice(0, 500),
      latencyMs: Date.now() - startTime,
      contextEnrichments: { weather: !!weatherData, weatherCached: weatherData?.cached ?? null, currency: 'USD' },
    })
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error?.message || 'Unknown error' })}\n\n`)
      res.end()
    } catch {
      // response already closed
    }
  }
}

export const config = { maxDuration: 60 }
