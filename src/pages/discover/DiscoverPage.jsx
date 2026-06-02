import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Search, Filter, X, Sparkles, Compass } from 'lucide-react'
import { updateOnboarding } from '../../store/slices/tripSlice'
import DestinationCard from '../../components/cards/DestinationCard'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import destinationsDatabase from '../../constants/destinations'
import useDebounce from '../../hooks/useDebounce'
import usePageTitle from '../../hooks/usePageTitle'

const DiscoverPage = () => {
  usePageTitle('Discover')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const categories = ['All', ...new Set(destinationsDatabase.map(d => d.category))]
  
  const filteredDestinations = useMemo(() => {
    return destinationsDatabase.filter(dest => {
      const matchesSearch = 
        dest.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        dest.subtitle.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        dest.highlight.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        dest.interests.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [debouncedSearch, selectedCategory])
  
  const handlePersonalizeFromDiscover = (destination) => {
    // Prefill onboarding with destination data
    dispatch(updateOnboarding({
      destination: destination.title,
      duration: parseInt(destination.duration.split('-')[0]) || 5,
      budget: destination.budget,
      interests: destination.interests,
      travelers: 2
    }))
    navigate('/planner')
  }

  const handleCreateCustomPlan = () => {
    navigate('/plan')
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Next Adventure</h1>
          <p className="text-gray-600 text-lg">Explore trending destinations and get inspired for your next journey</p>
        </div>
        
        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search destinations by name, interest, or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center max-w-2xl mx-auto bg-white rounded-2xl p-12 shadow-card">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Destination Not Found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't find "{searchTerm}" in our database. But don't worry! 
              You can create a custom AI-powered itinerary for any destination.
            </p>
            <Button onClick={handleCreateCustomPlan} icon={Sparkles}>
              Create Custom Plan
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Found {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  {...destination}
                  onClick={() => handlePersonalizeFromDiscover(destination)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage