import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const TimelineDay = ({ day, index, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-primary-50 px-5 py-4 flex items-center justify-between hover:bg-primary-100 transition"
      >
        <h3 className="text-lg font-bold text-gray-800">{day.title || `Day ${index + 1}`}</h3>
        {open ? <ChevronUp className="w-5 h-5 text-primary-500" /> : <ChevronDown className="w-5 h-5 text-primary-500" />}
      </button>

      {open && (
        <div className="p-5 space-y-4">
          {day.activities?.map((activity, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-20">
                <span className="bg-slate-50 text-slate-700 font-semibold px-2 py-1 rounded-lg text-sm block text-center">
                  {activity.time || `${9 + idx}:00`}
                </span>
              </div>
              <div className="border-l-2 border-primary-100 pl-4 flex-1">
                <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                {activity.description && (
                  <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
                )}
                {activity.cost > 0 && (
                  <p className="text-primary-600 text-sm mt-1 font-medium">~ ${activity.cost}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimelineDay
