import React from 'react'

const SkeletonCard = ({ lines = 3, showHeader = true }) => {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
      {showHeader && (
        <div className="h-4 bg-slate-200 rounded-full w-2/3 mb-4" />
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-100 rounded-full"
            style={{ width: `${100 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default SkeletonCard
