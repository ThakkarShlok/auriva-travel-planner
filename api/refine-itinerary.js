import { callGroq, assertGroqKey } from './_lib/groq.js'

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

Preserve unchanged days exactly as-is. Only modify what the user specifically asked about. If they say "make day 2 less hectic," return the same Day 1, 3, 4... with only Day 2 modified. All monetary values in USD. Real place names only. No markdown fences.`

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed', code: 'MethodNotAllowed' })
    }

    assertGroqKey()

    const { itinerary, instruction, context } = req.body ?? {}

    if (!itinerary || typeof itinerary !== 'object') {
      return res.status(400).json({ error: 'itinerary is required', code: 'ValidationError' })
    }
    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return res.status(400).json({ error: 'instruction is required', code: 'ValidationError' })
    }
    if (instruction.length > 1000) {
      return res.status(400).json({ error: 'instruction too long (max 1000 chars)', code: 'ValidationError' })
    }

    const userPrompt = `Current itinerary:\n${JSON.stringify(itinerary)}\n\nDestination: ${context?.destination || 'Unknown'}, ${context?.duration || '?'} days.\n\nUser request: ${instruction.trim()}\n\nReturn the full updated itinerary as JSON.`

    const content = await callGroq({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: REFINE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      responseFormat: { type: 'json_object' },
      timeoutMs: 30000,
    })

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return res.status(502).json({ error: 'AI returned malformed JSON', code: 'BadJSON' })
    }

    console.log('[api] /api/refine-itinerary success')
    return res.status(200).json(parsed)

  } catch (error) {
    console.error('[api error refine]', error?.name, error?.message)
    const status = error?.status || 500
    return res.status(status).json({
      error: error?.message || 'Unknown server error',
      code: error?.code || error?.name || 'UnknownError',
      timestamp: new Date().toISOString(),
    })
  }
}

export const config = { maxDuration: 60 }
