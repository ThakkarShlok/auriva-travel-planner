import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Rendered inside the full-width banner row in the Today card body (TimelineDay).
 * Shows a spinning "Refreshing…" state while the fetch is in flight,
 * then switches to "Updated just now / Nm ago" on success.
 * Renders null if neither refreshing nor lastRefreshed — banner row in parent also hides.
 */
const WeatherRefreshIndicator = ({ refreshing, lastRefreshed, generatedAt }) => {
  const [, forceUpdate] = useState(0)

  // Tick every 30s so relative time stays current without a page reload
  useEffect(() => {
    if (!lastRefreshed) return
    const id = setInterval(() => forceUpdate(n => n + 1), 30_000)
    return () => clearInterval(id)
  }, [lastRefreshed])

  if (!refreshing && !lastRefreshed) return null

  const relativeTime = lastRefreshed ? formatRelative(lastRefreshed) : null

  return (
    <div
      className="flex items-center gap-2 cursor-default select-none"
      title={
        lastRefreshed
          ? `Forecast refreshed at ${lastRefreshed.toLocaleTimeString()}.${generatedAt ? ` Original 14-day forecast was generated ${new Date(generatedAt).toLocaleDateString()}.` : ''}`
          : 'Fetching live 3-day forecast…'
      }
    >
      <RefreshCw
        className={`w-4 h-4 flex-shrink-0 ${refreshing ? 'animate-spin text-indigo-500' : 'text-emerald-600'}`}
      />
      <span className={`text-sm font-semibold ${refreshing ? 'text-indigo-600' : 'text-emerald-700'}`}>
        {refreshing ? 'Refreshing forecast…' : `Weather updated ${relativeTime}`}
      </span>
    </div>
  )
}

function formatRelative(date) {
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  return `${diffHr}h ago`
}

export default WeatherRefreshIndicator
