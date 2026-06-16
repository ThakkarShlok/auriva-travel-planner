import React from 'react'

const variants = {
  primary: 'bg-primary-600/90 text-white',
  secondary: 'bg-white/90 text-slate-700 border border-slate-200',
  accent: 'bg-accent-500/90 text-white',
  success: 'bg-emerald-500/90 text-white',
  warning: 'bg-amber-400/90 text-slate-800',
}

const Badge = ({ children, variant = 'primary', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${variants[variant] ?? variants.primary} ${className}`}>
    {children}
  </span>
)

export default Badge
