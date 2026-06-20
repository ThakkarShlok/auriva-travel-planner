import { parse as parsePartialJson } from 'partial-json'

/**
 * Stream an itinerary from the backend SSE endpoint.
 * Calls callbacks as tokens arrive and attempts partial JSON parsing on each chunk.
 *
 * @param {object} preferences - Trip preferences (destination, duration, budget, travelers, interests)
 * @param {object} opts
 * @param {AbortSignal} opts.signal - Abort signal (pass the thunk's signal for RTK cancellation)
 * @param {(delta: string, accumulated: string) => void} opts.onToken - Called on each token chunk
 * @param {(partial: object) => void} opts.onPartialJson - Called when partial JSON is parseable
 * @param {(final: object) => void} opts.onDone - Called when streaming is complete with final JSON
 * @param {(msg: string) => void} opts.onError - Called on error ('aborted' for clean abort)
 * @param {(weather: object|null) => void} opts.onWeather - Called once with the forecast (or null) before generation starts
 */
export async function streamItinerary(preferences, { signal, onToken, onPartialJson, onDone, onError, onWeather } = {}) {
  let response
  try {
    response = await fetch('/api/generate-itinerary-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      onError?.('aborted')
    } else {
      onError?.(`Network error: ${error.message}`)
    }
    return
  }

  if (!response.ok || !response.body) {
    onError?.(`Server error: ${response.status}`)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let accumulatedContent = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })

      // SSE blocks are separated by "\n\n"
      const blocks = buf.split('\n\n')
      buf = blocks.pop() ?? ''

      for (const block of blocks) {
        if (!block.trim()) continue

        let eventName = 'message'
        let dataLine = ''
        for (const line of block.split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7).trim()
          else if (line.startsWith('data: ')) dataLine = line.slice(6)
        }
        if (!dataLine) continue

        let data
        try {
          data = JSON.parse(dataLine)
        } catch {
          continue
        }

        if (eventName === 'token' && data.content) {
          accumulatedContent += data.content
          onToken?.(data.content, accumulatedContent)

          // Attempt partial JSON parse — only when there's enough content
          if (accumulatedContent.length > 20) {
            try {
              const partial = parsePartialJson(accumulatedContent)
              if (partial && typeof partial === 'object') {
                onPartialJson?.(partial)
              }
            } catch {
              // Not yet parseable — continue accumulating
            }
          }
        } else if (eventName === 'done') {
          // Stream complete — do a strict JSON.parse for the final result
          try {
            const final = JSON.parse(accumulatedContent)
            onDone?.(final)
          } catch (err) {
            // Try partial-json as fallback (e.g., trailing comma edge cases)
            try {
              const fallback = parsePartialJson(accumulatedContent)
              if (fallback && typeof fallback === 'object') {
                onDone?.(fallback)
              } else {
                onError?.(`Final JSON parse failed: ${err.message}`)
              }
            } catch {
              onError?.(`Final JSON parse failed: ${err.message}`)
            }
          }
        } else if (eventName === 'error') {
          onError?.(data.error || 'Unknown stream error')
        } else if (eventName === 'weather') {
          onWeather?.(data ?? null)
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      onError?.('aborted')
    } else {
      onError?.(`Stream read error: ${error.message}`)
    }
  }
}

/**
 * Send a refinement request for an existing itinerary.
 *
 * @param {object} itinerary - Current itinerary JSON
 * @param {string} instruction - User's modification request
 * @param {object} context - { destination, duration }
 * @param {object} opts - { signal }
 * @returns {Promise<object>} Updated itinerary JSON
 */
export async function refineItinerary(itinerary, instruction, context, { signal } = {}) {
  const response = await fetch('/api/refine-itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itinerary, instruction, context }),
    signal,
  })

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status}`
    try {
      const errBody = await response.json()
      errorMsg = errBody.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  return response.json()
}
