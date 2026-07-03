import React from 'react'

const TodayBadge = ({ date }) => (
  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full">
    {/* Pulsing dot signals live / current-day status */}
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
    </span>
    Today
    {date && <span className="font-normal text-indigo-500">· {date}</span>}
  </div>
)

export default TodayBadge
