import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'
import Button from '../components/UI/Button'
import usePageTitle from '../hooks/usePageTitle'

const NotFoundPage = () => {
  usePageTitle('Page Not Found')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md mx-auto">
        {/* Slow-spinning compass — uses Tailwind's built-in spin keyframe at 8s */}
        <div className="flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center"
            style={{ animation: 'spin 8s linear infinite' }}
          >
            <Compass className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <p className="text-9xl font-black text-amber-400 leading-none mb-2 tracking-tighter select-none">
          404
        </p>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">Lost in transit</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          This page packed its bags and left without leaving a forwarding address.
          Your next adventure is still out there — let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" icon={Home} size="lg">Back to home</Button>
          </Link>
          <Link to="/discover">
            <Button variant="outline" icon={Compass} size="lg">Discover places</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
