import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { generateItinerary, saveTrip, clearCurrentTrip, clearError, updateOnboarding } from '../../store/slices/tripSlice'
import { Calendar, MapPin, Users, DollarSign, Loader2, Download, RefreshCw } from 'lucide-react'

const PlannerPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { onboardingData, currentTrip, loading, error } = useSelector(state => state.trip)
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Read query params and prefill onboarding when provided (from "Personalize" links)
    const params = new URLSearchParams(location.search)
    const dest = params.get('destination')
    const duration = params.get('duration')
    const travelers = params.get('travelers')
    if (dest) {
      dispatch(updateOnboarding({
        destination: dest,
        duration: duration ? Number(duration) : undefined,
        travelers: travelers ? Number(travelers) : undefined
      }))
    }

    if (!onboardingData.destination) {
      navigate('/plan')
      return
    }
    
    // Only generate if no current trip and not loading
    if (!currentTrip && !loading && !error) {
      dispatch(generateItinerary(onboardingData))
    }
  }, [onboardingData, currentTrip, loading, error, dispatch, navigate])

  const handleSaveTrip = () => {
    if (currentTrip && isAuthenticated) {
      const tripToSave = {
        ...currentTrip,
        destination: onboardingData.destination,
        duration: onboardingData.duration,
        travelers: onboardingData.travelers,
        budget: onboardingData.budget,
        savedAt: new Date().toISOString()
      }
      dispatch(saveTrip(tripToSave))
    } else if (!isAuthenticated) {
      alert('Please login to save trips')
      navigate('/login')
    }
  }

  const handleRegenerate = () => {
    dispatch(generateItinerary(onboardingData))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Crafting Your Itinerary...</h3>
          <p className="text-gray-500 mt-2">Our AI is finding the best experiences for you</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😞</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRegenerate} className="bg-ocean-600 text-white px-6 py-2 rounded-xl hover:bg-ocean-700 transition">
              Try Again
            </button>
            <button onClick={() => navigate('/plan')} className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50 transition">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrip) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Your {onboardingData.destination} Adventure
              </h1>
              <div className="flex flex-wrap gap-4 text-secondary-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{onboardingData.duration} Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{onboardingData.travelers} Travelers</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="capitalize">{onboardingData.budget}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveTrip} className="bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2 rounded-xl transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Save Trip
              </button>
              <button onClick={handleRegenerate} className="bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2 rounded-xl transition flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Itinerary Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentTrip.days?.map((day, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-5 border-b">
                  <h3 className="text-xl font-bold text-gray-800">{day.title || `Day ${index + 1}`}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {day.activities?.map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-24">
                        <div className="bg-secondary-50 text-secondary-700 font-semibold px-3 py-1 rounded-lg text-sm text-center">
                          {activity.time || `${9 + idx}:00`}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                        <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
                        {activity.cost > 0 && (
                          <p className="text-primary-600 text-sm mt-1 font-medium">💰 ${activity.cost}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Budget */}
            {currentTrip.budget && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(currentTrip.budget).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-500">{key}</span>
                        <span className="font-semibold text-gray-800">${value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {currentTrip.hotels?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🏨 Recommended Hotels</h3>
                <ul className="space-y-2">
                  {currentTrip.hotels.map((hotel, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      {hotel}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packing */}
            {currentTrip.packing?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🎒 Packing List</h3>
                <ul className="space-y-2">
                  {currentTrip.packing.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-sunset-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {currentTrip.tips?.length > 0 && (
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Travel Tips</h3>
                <ul className="space-y-2">
                  {currentTrip.tips.map((tip, idx) => (
                    <li key={idx} className="text-gray-600 text-sm">{tip}</li>
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

export default PlannerPage