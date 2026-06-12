import { assertGroqKey } from './_lib/groq.js'

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
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed', code: 'MethodNotAllowed' })
    }

    const apiKey = assertGroqKey()

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

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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

  } catch (error) {
    console.error('[api stream error]', error?.name, error?.message)
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error?.message || 'Unknown error' })}\n\n`)
      res.end()
    } catch {
      // response already closed
    }
  }
}

export const config = { maxDuration: 60 }
