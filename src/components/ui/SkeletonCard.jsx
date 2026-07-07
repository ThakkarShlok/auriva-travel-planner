import React from 'react'

const SkeletonCard = ({ lines = 3, showHeader = true, imageHeight = null }) => {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {imageHeight && (
        <div className={`skeleton-shimmer ${imageHeight}`} />
      )}
      <div className="p-6">
        {showHeader && (
          <div className="skeleton-shimmer h-4 rounded-full w-2/3 mb-4" />
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer h-3 rounded-full"
              style={{ width: `${100 - i * 12}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard
