import { callGroq, GroqError, assertGroqKey } from './_lib/groq.js'

const SYSTEM_PROMPT = `You are Auriva, a helpful AI travel assistant. Give concise, accurate, practical travel advice. Recommend real places, real hotels, and real services. If you're uncertain about something, say so rather than guessing.`

export default async function handler(req, res) {
  // Outermost try ensures NOTHING leaves this function uncaught
  try {
    console.log('[api]', req.method, req.url, 'body length:', JSON.stringify(req.body || {}).length)

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed', code: 'MethodNotAllowed' })
    }

    // Validate env first so the error is clear
    assertGroqKey()

    const { message, history = [] } = req.body ?? {}

    if (!message || typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return res.status(400).json({ error: 'message must be a non-empty string under 2000 characters', code: 'ValidationError' })
    }
    if (!Array.isArray(history) || history.length > 20) {
      return res.status(400).json({ error: 'history must be an array of at most 20 messages', code: 'ValidationError' })
    }

    const content = await callGroq({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 600,
      timeoutMs: 25000,
    })

    console.log('[api]', req.url, 'success')
    return res.status(200).json({ message: content })

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
