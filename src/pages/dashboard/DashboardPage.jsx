import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Trash2, Eye, Sparkles } from 'lucide-react'
import { deleteTrip } from '../../store/slices/tripSlice'

const DashboardPage = () => {
  const { savedTrips } = useSelector(state => state.trip)
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="container-custom text-center max-w-md mx-auto bg-white rounded-2xl shadow-xl p-12">
          <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-10 h-10 text-secondary-600" /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please login to view your saved trips</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold">Login</Link>
        </div>
      </div>
    )
  }

  if (savedTrips.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="container-custom text-center max-w-md mx-auto bg-white rounded-2xl shadow-xl p-12">
          <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-10 h-10 text-secondary-600" /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Saved Trips Yet</h2>
          <p className="text-gray-500 mb-6">Start planning your first adventure</p>
          <Link to="/plan" className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold">Plan a Trip</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Saved Trips</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center"><span className="text-5xl">✈️</span></div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.destination || 'My Trip'}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><Calendar className="w-4 h-4" /><span>{trip.duration} days</span></div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><Users className="w-4 h-4" /><span>{trip.travelers} travelers</span></div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><MapPin className="w-4 h-4" /><span className="capitalize">{trip.budget} budget</span></div>
                </div>
                <div className="flex gap-3">
                  <Link to={`/itinerary/${trip.id}`} state={{ trip }} className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 rounded-xl text-center hover:shadow-md transition flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> View</Link>
                  <button onClick={() => dispatch(deleteTrip(trip.id))} className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage