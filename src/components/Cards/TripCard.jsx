import React from 'react'
import { Calendar, Users, DollarSign, Eye, Trash2, Copy } from 'lucide-react'
import Button from '../UI/Button'

const GRADIENT_COLORS = [
  'from-primary-700 to-primary-900',
  'from-slate-700 to-slate-900',
  'from-primary-800 to-slate-900',
  'from-primary-600 to-primary-800',
]

const TripCard = ({ trip, image, onView, onDelete, onDuplicate }) => {
  const gradientIdx = trip.destination
    ? trip.destination.charCodeAt(0) % GRADIENT_COLORS.length
    : 0

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group">
      {/* Image or gradient header */}
      <div className="h-36 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${GRADIENT_COLORS[gradientIdx]} flex items-center justify-center`}>
            <span className="text-4xl">✈️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
            {trip.budget}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-3 truncate">{trip.destination || 'My Trip'}</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
            <Calendar className="w-3 h-3" />
            {trip.duration} days
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" />
            {trip.travelers}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full capitalize">
            <DollarSign className="w-3 h-3" />
            {trip.budget}
          </span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={onView} className="flex-1" icon={Eye}>
            View
          </Button>
          <button
            onClick={onDuplicate}
            title="Duplicate trip"
            className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete trip"
            className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TripCard
