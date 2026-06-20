// localStorage-backed queue for offline-first mutations.
// Deduplicated by dedupeKey (latest wins) so replaying always sends the most recent state.

const QUEUE_KEY = 'auriva_mutation_queue'

function load() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

function save(queue) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)) } catch {}
}

export function enqueue(mutation) {
  const { dedupeKey, endpoint, method, body } = mutation
  const queue = load()
  const filtered = dedupeKey ? queue.filter(m => m.dedupeKey !== dedupeKey) : queue
  filtered.push({
    id: crypto.randomUUID(),
    dedupeKey: dedupeKey ?? null,
    endpoint,
    method,
    body,
    timestamp: Date.now(),
  })
  save(filtered)
}

export function peek() {
  return load()
}

export async function flush(execFn) {
  const queue = load()
  if (!queue.length) return
  save([]) // clear before replay — dedupe means replaying latest state is idempotent
  for (const mutation of queue) {
    try {
      await execFn(mutation)
    } catch (err) {
      console.warn('[mutationQueue] replay failed:', mutation.dedupeKey, err.message)
    }
  }
}
