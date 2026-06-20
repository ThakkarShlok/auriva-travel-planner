// Uses local timezone throughout — trip dates are calendar days, not instants.

function localDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(dateStr, days) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(y, mo - 1, d + days)
  return localDateString(date)
}

export function isDateInTripRange(startDate, durationDays) {
  if (!startDate || !durationDays) return false
  const today = localDateString()
  const endDate = addDays(startDate, durationDays - 1)
  return today >= startDate && today <= endDate
}

export function dayIndexForToday(startDate) {
  if (!startDate) return -1
  const today = localDateString()
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const startMs = new Date(sy, sm - 1, sd).getTime()
  const todayMs = new Date(ty, tm - 1, td).getTime()
  const diffDays = Math.round((todayMs - startMs) / (1000 * 60 * 60 * 24))
  return diffDays
}

export function formatTripDate(startDate, dayIndex) {
  if (!startDate) return null
  const [y, m, d] = startDate.split('-').map(Number)
  const date = new Date(y, m - 1, d + dayIndex)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
