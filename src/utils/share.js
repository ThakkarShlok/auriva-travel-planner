export function isWebShareSupported() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function shareNative({ url, title, text }) {
  if (!isWebShareSupported()) return false
  try {
    await navigator.share({ url, title, text })
    return true
  } catch (err) {
    if (err.name === 'AbortError') return false
    console.warn('Native share failed:', err.message)
    return false
  }
}

export function whatsappShareUrl({ url, text }) {
  const message = text ? `${text} ${url}` : url
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function twitterShareUrl({ url, text }) {
  const params = new URLSearchParams()
  if (text) params.set('text', text)
  params.set('url', url)
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function telegramShareUrl({ url, text }) {
  const params = new URLSearchParams({ url, text: text || '' })
  return `https://t.me/share/url?${params.toString()}`
}

export function emailShareUrl({ url, title, text }) {
  const subject = title || 'Check out this trip'
  const body = text ? `${text}\n\n${url}` : url
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
