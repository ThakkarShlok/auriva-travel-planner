// Custom error class — always thrown from this module
export class GroqError extends Error {
  constructor(message, status = 502, code = 'GroqError') {
    super(message)
    this.name = 'GroqError'
    this.status = status
    this.code = code
  }
}

// Env validation — call this AT THE TOP OF EVERY HANDLER, never at module load
export function assertGroqKey() {
  const raw = process.env.GROQ_API_KEY
  if (raw === undefined || raw === null) {
    throw new GroqError(
      'GROQ_API_KEY environment variable is not set. Add it to .env.local for local dev (use `printf` not `echo` to avoid BOM) or to Vercel project settings for production.',
      500,
      'EnvMissing'
    )
  }
  const trimmed = String(raw).trim()
  if (trimmed.length === 0) {
    throw new GroqError('GROQ_API_KEY is empty after trim.', 500, 'EnvEmpty')
  }
  // Detect BOM
  if (raw.charCodeAt(0) === 0xFEFF) {
    throw new GroqError(
      'GROQ_API_KEY contains a UTF-8 BOM. Recreate .env.local using `printf` (not `echo`).',
      500,
      'EnvBOM'
    )
  }
  if (!trimmed.startsWith('gsk_')) {
    throw new GroqError(
      `GROQ_API_KEY does not start with "gsk_" (got: "${trimmed.slice(0, 6)}..."). Verify the key is correct.`,
      500,
      'EnvMalformed'
    )
  }
  // Detect any control chars
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i)
    if (code < 32 || code === 127) {
      throw new GroqError(
        `GROQ_API_KEY contains invalid control character at position ${i} (char code ${code}).`,
        500,
        'EnvBadChars'
      )
    }
  }
  return trimmed
}

// The actual Groq call
export async function callGroq({ model, messages, temperature = 0.7, max_tokens, responseFormat, timeoutMs = 25000 }) {
  const apiKey = assertGroqKey()

  if (!model || typeof model !== 'string') {
    throw new GroqError('callGroq: model is required', 500, 'BadArgs')
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new GroqError('callGroq: messages must be a non-empty array', 500, 'BadArgs')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const body = { model, messages, temperature, max_tokens }
    if (responseFormat) body.response_format = responseFormat

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      let detail = text.slice(0, 500)
      try {
        const parsed = JSON.parse(text)
        detail = parsed?.error?.message || detail
      } catch {}
      throw new GroqError(
        `Groq API ${response.status}: ${detail || response.statusText}`,
        response.status === 401 ? 500 : 502,
        `GroqHTTP${response.status}`
      )
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new GroqError('Groq returned unexpected response shape (no choices[0].message.content).', 502, 'GroqShape')
    }
    return content
  } catch (error) {
    clearTimeout(timer)
    if (error instanceof GroqError) throw error
    if (error?.name === 'AbortError') {
      throw new GroqError(`Groq API timed out after ${timeoutMs}ms`, 504, 'GroqTimeout')
    }
    throw new GroqError(`Network error calling Groq: ${error?.message || 'unknown'}`, 502, 'GroqNetwork')
  }
}
