import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Eye, Trash2, Copy } from 'lucide-react';
import Button from '../ui/Button';

const TripCard = ({ trip, onView, onDelete, onDuplicate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center relative">
        <span className="text-5xl">✈️</span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.destination || 'My Trip'}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{trip.duration} days</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Users className="w-4 h-4" />
            <span>{trip.travelers} travelers</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <DollarSign className="w-4 h-4" />
            <span className="capitalize">{trip.budget} budget</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={onView} className="flex-1" icon={Eye}>
            View
          </Button>
          <Button size="sm" variant="secondary" onClick={onDuplicate} icon={Copy}>
            Duplicate
          </Button>
          <button
            onClick={onDelete}
            className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;