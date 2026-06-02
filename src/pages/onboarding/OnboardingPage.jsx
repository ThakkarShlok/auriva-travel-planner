import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateOnboarding } from '../../store/slices/tripSlice'
import { MapPin, Calendar, Users, Wallet, Heart, ArrowRight, Sparkles } from 'lucide-react'

const OnboardingPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    destination: '', startDate: '', endDate: '', duration: 3, budget: 'moderate', travelers: 2, interests: ''
  })
  
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate), end = new Date(formData.endDate)
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
      if (diffDays > 0) setFormData(prev => ({ ...prev, duration: diffDays }))
    }
  }, [formData.startDate, formData.endDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.destination) { alert('Please enter a destination'); return }
    dispatch(updateOnboarding(formData))
    navigate('/planner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
      <div className="container-custom max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl font-bold text-gray-800">Plan Your Adventure</h1>
            <p className="text-gray-500 mt-2">Tell us about your dream trip</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Where do you want to go?</label>
              <div className="relative"><MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="Paris, Tokyo, New York..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <div className="relative"><Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500" />
                </div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <div className="relative"><Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500" />
                </div>
              </div>
            </div>
            
            {formData.startDate && formData.endDate && (<div className="bg-secondary-50 p-4 rounded-xl text-center"><p className="text-secondary-700 font-semibold">✨ Trip Duration: {formData.duration} days</p></div>)}
            
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                <div className="relative"><Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500">
                    <option value="budget">Budget ($)</option><option value="moderate">Moderate ($$)</option><option value="luxury">Luxury ($$$)</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Travelers</label>
                <div className="relative"><Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="number" min="1" max="20" value={formData.travelers} onChange={(e) => setFormData({ ...formData, travelers: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500" />
                </div>
              </div>
            </div>
            
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Your Interests</label>
              <div className="relative"><Heart className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <textarea rows="3" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} placeholder="History, Food, Nature, Adventure, Art" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500"></textarea>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              Generate Itinerary <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage