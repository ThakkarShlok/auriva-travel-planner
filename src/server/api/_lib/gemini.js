export class GeminiError extends Error {
  constructor(message, status = 502, code = 'GeminiError') {
    super(message)
    this.name = 'GeminiError'
    this.status = status
    this.code = code
  }
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

export function assertGeminiKey() {
  const raw = process.env.GEMINI_API_KEY
  if (raw === undefined || raw === null) {
    throw new GeminiError(
      'GEMINI_API_KEY environment variable is not set. Add it to .env.local for local dev or to Vercel project settings for production.',
      500,
      'EnvMissing'
    )
  }
  const trimmed = String(raw).trim()
  if (trimmed.length === 0) {
    throw new GeminiError('GEMINI_API_KEY is empty after trim.', 500, 'EnvEmpty')
  }
  if (raw.charCodeAt(0) === 0xFEFF) {
    throw new GeminiError('GEMINI_API_KEY contains a UTF-8 BOM. Recreate the env file without a BOM.', 500, 'EnvBOM')
  }
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i)
    if (code < 32 || code === 127) {
      throw new GeminiError(
        `GEMINI_API_KEY contains invalid control character at position ${i} (char code ${code}).`,
        500,
        'EnvBadChars'
      )
    }
  }
  return trimmed
}

export async function callGemini({ model = GEMINI_MODEL, messages, temperature = 0.7, max_tokens, responseFormat, timeoutMs = 25000 }) {
  const apiKey = assertGeminiKey()

  if (!model || typeof model !== 'string') {
    throw new GeminiError('callGemini: model is required', 500, 'BadArgs')
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new GeminiError('callGemini: messages must be a non-empty array', 500, 'BadArgs')
  }

  const systemMessage = messages.find(message => message.role === 'system')
  const contents = messages
    .filter(message => message.role !== 'system')
    .map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content ?? '') }],
    }))
  const generationConfig = { temperature }
  if (max_tokens !== undefined) generationConfig.maxOutputTokens = max_tokens
  if (responseFormat?.type === 'json_object') generationConfig.responseMimeType = 'application/json'

  const body = { contents, generationConfig }
  if (systemMessage) body.systemInstruction = { parts: [{ text: String(systemMessage.content ?? '') }] }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
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
      throw new GeminiError(
        `Gemini API ${response.status}: ${detail || response.statusText}`,
        response.status === 401 || response.status === 403 ? 500 : 502,
        `GeminiHTTP${response.status}`
      )
    }

    const data = await response.json()
    const parts = data?.candidates?.[0]?.content?.parts
    const content = Array.isArray(parts) ? parts.map(part => part.text ?? '').join('') : null
    if (typeof content !== 'string' || !content) {
      throw new GeminiError('Gemini returned an unexpected response shape (no candidate text).', 502, 'GeminiShape')
    }
    return content
  } catch (error) {
    clearTimeout(timer)
    if (error instanceof GeminiError) throw error
    if (error?.name === 'AbortError') {
      throw new GeminiError(`Gemini API timed out after ${timeoutMs}ms`, 504, 'GeminiTimeout')
    }
    throw new GeminiError(`Network error calling Gemini: ${error?.message || 'unknown'}`, 502, 'GeminiNetwork')
  }
}