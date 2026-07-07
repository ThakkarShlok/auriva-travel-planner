import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left — hero panel, desktop only */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 hero-gradient flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight">Auriva</span>
            <p className="text-xs text-primary-300 tracking-wider -mt-0.5">AI TRAVEL</p>
          </div>
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-300 mb-4">
            AI-POWERED TRAVEL
          </p>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Plan trips that<br />feel like yours.
          </h2>
          <p className="mt-4 text-primary-200 text-lg leading-relaxed">
            Personalized itineraries powered by AI.<br />
            Your style, your pace, your adventure.
          </p>
        </div>

        <p className="text-primary-300 text-sm">Trusted by travelers from 50+ countries</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-800 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">Auriva</span>
          </Link>

          {title && <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>}
          {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}
          {children}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Why sign in?</p>
            <ul className="space-y-2">
              {[
                'Save trips and access them from any device',
                'Refine your itinerary with AI as you plan',
                'Track actual spend and build your travel history',
              ].map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
