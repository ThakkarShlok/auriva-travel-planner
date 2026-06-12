import React from 'react'

const FeatureGrid = ({ features = [], columns = 3 }) => {
  const colClass = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[columns] || 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {features.map((feature, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover transition-shadow">
          {feature.icon && (
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 text-primary-600">
              {feature.icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
          {feature.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default FeatureGrid
