import React from 'react';
import { Clock, Star } from 'lucide-react';
import Badge from '../ui/Badge';

const DestinationCard = ({ title, subtitle, category, duration, rating = 4.5, image, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={image || '/destination-placeholder.svg'}
          alt={title}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/destination-placeholder.svg' }}
          className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge variant="primary">{category}</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-700">{rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-3">{subtitle}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <Badge variant="secondary">Explore →</Badge>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
