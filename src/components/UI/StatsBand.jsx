import React from 'react'

const StatsBand = ({ stats = [], variant = 'dark' }) => {
  const isDark = variant !== 'light'
  return (
    <div className={isDark ? 'bg-primary-800 text-white py-12' : 'bg-white text-slate-900 py-12'}>
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className={`text-sm font-medium ${isDark ? 'text-primary-200' : 'text-slate-500'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsBand
