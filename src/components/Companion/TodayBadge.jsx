import React from 'react'
import { Star } from 'lucide-react'

const TodayBadge = ({ date }) => (
  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full">
    <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
    Today
    {date && <span className="font-normal text-indigo-500">· {date}</span>}
  </div>
)

export default TodayBadge
