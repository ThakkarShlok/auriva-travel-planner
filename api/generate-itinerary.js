import { callGroq, GroqError, assertGroqKey } from './_lib/groq.js'

const SYSTEM_PROMPT = `You are an expert travel planner. Respond with a JSON object only, no markdown fences. Use this exact schema:
{
  "overview": "string — 2-3 sentence trip summary",
  "days": [{ "title": "string", "activities": [{ "time": "HH:MM", "title": "string", "description": "string", "cost": number }] }],
  "budget": { "accommodation": number, "food": number, "activities": number, "transport": number },
  "hotels": ["string"],
  "packing": ["string"],
  "tips": ["string"]
}
All monetary values are in USD. Use real hotel names, real restaurant names, real landmarks — never invent placeholder names.`

export default async function handler(req, res) {
  // Outermost try ensures NOTHING leaves this function uncaught
  try {
    console.log('[api]', req.method, req.url, 'body length:', JSON.stringify(req.body || {}).length)

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed', code: 'MethodNotAllowed' })
    }

    // Validate env first so the error is clear
    assertGroqKey()

    const { destination, duration, budget, travelers, interests } = req.body ?? {}

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ error: 'destination is required', code: 'ValidationError' })
    }
    const days = Number(duration)
    if (!days || days < 1 || days > 30) {
      return res.status(400).json({ error: 'duration must be a number between 1 and 30', code: 'ValidationError' })
    }

    const userPrompt = `Create a ${days}-day travel itinerary for ${destination.trim()}.
Budget level: ${budget || 'moderate'}. Travelers: ${travelers || 2}.
Interests: ${interests || 'sightseeing, local food, culture'}.
Include ${days} days of activities with specific real place names.`

    const content = await callGroq({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      responseFormat: { type: 'json_object' },
      timeoutMs: 25000,
    })

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return res.status(502).json({ error: 'AI returned malformed JSON', code: 'BadJSON' })
    }

    console.log('[api]', req.url, 'success')
    return res.status(200).json(parsed)

  } catch (error) {
    console.error('[api error]', {
      url: req.url,
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
    })

    const status = error?.status || 500
    return res.status(status).json({
      error: error?.message || 'Unknown server error',
      code: error?.code || error?.name || 'UnknownError',
      timestamp: new Date().toISOString(),
    })
  }
}

export const config = { maxDuration: 60 }
