import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Clock, ArrowLeft } from 'lucide-react'

const ItineraryDetailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { trip } = location.state || {}

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-600 mb-4">No itinerary found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const itineraryData = trip.details || trip

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container-custom">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-dark-600 hover:text-primary-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {trip.preferences?.destination || trip.destination} Adventure
          </h1>
          <div className="flex flex-wrap gap-4 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{trip.preferences?.duration || trip.duration} Days</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.preferences?.destination || trip.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="capitalize">{trip.preferences?.budget || trip.budget}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {itineraryData.days?.map((day, index) => (
              <div key={index} className="card overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 border-b border-dark-100">
                  <h3 className="text-xl font-bold text-dark-800">Day {index + 1}: {day.title}</h3>
                </div>
                <div className="p-6 space-y-4">
                  {day.activities?.map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-24">
                        <div className="bg-primary-100 text-primary-700 font-semibold px-3 py-1 rounded-lg text-sm text-center">
                          {activity.time}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-800">{activity.title}</h4>
                        <p className="text-dark-600 text-sm mt-1">{activity.description}</p>
                        {activity.cost && (
                          <p className="text-primary-600 text-sm mt-2 font-medium">💰 ${activity.cost}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {itineraryData.budget && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(itineraryData.budget).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-dark-600">{key}</span>
                        <span className="font-semibold text-dark-800">${value}</span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {itineraryData.packing && itineraryData.packing.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">🎒 Packing List</h3>
                <ul className="space-y-2">
                  {itineraryData.packing.map((item, index) => (
                    <li key={index} className="text-dark-600 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItineraryDetailPage