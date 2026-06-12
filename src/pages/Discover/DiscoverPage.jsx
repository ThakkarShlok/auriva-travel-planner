import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X, Sparkles } from 'lucide-react'
import { updateOnboarding } from '../../store/slices/tripSlice'
import DestinationCard from '../../components/Cards/DestinationCard'
import Button from '../../components/UI/Button'
import PageHeader from '../../components/UI/PageHeader'
import EmptyState from '../../components/UI/EmptyState'
import destinationsDatabase from '../../constants/destinations'
import useDebounce from '../../hooks/useDebounce'
import usePageTitle from '../../hooks/usePageTitle'

const DiscoverPage = () => {
  usePageTitle('Discover')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const categories = ['All', ...new Set(destinationsDatabase.map(d => d.category))]

  const filteredDestinations = useMemo(() => {
    return destinationsDatabase.filter(dest => {
      const q = debouncedSearch.toLowerCase()
      const interestsMatch = Array.isArray(dest.interests)
        ? dest.interests.some(i => i.toLowerCase().includes(q))
        : dest.interests.toLowerCase().includes(q)
      const matchesSearch =
        !q ||
        dest.title.toLowerCase().includes(q) ||
        dest.subtitle.toLowerCase().includes(q) ||
        dest.highlight.toLowerCase().includes(q) ||
        interestsMatch
      const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [debouncedSearch, selectedCategory])

  const handlePersonalize = (destination) => {
    dispatch(updateOnboarding({
      destination: destination.title,
      duration: parseInt(destination.duration.split('-')[0]) || 5,
      budget: destination.budget,
      interests: Array.isArray(destination.interests) ? destination.interests.join(', ') : destination.interests,
      travelers: 2,
    }))
    navigate(isAuthenticated ? '/planner' : '/login', isAuthenticated ? undefined : { state: { from: { pathname: '/planner' } } })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
  }

  const hasFilters = searchTerm !== '' || selectedCategory !== 'All'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="hero"
          eyebrow="EXPLORE"
          title="Find your next destination"
          description={`${destinationsDatabase.length}+ curated places. Click any to start planning.`}
        />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur border-b border-slate-100 shadow-soft">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destinations, interests, activities..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 bg-white text-slate-700 text-sm outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-custom py-8">
        {filteredDestinations.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No results for "${searchTerm}"`}
            description="Try a different search or browse all destinations."
            action={
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" onClick={handleClearFilters}>Clear filters</Button>
                <Button variant="outline" icon={Sparkles} onClick={() => navigate('/plan')}>
                  Plan a custom trip
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
              {hasFilters ? ' matching your filters' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  {...destination}
                  onClick={() => handlePersonalize(destination)}
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
