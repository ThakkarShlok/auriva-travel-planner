import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X, Sparkles, ArrowRight, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { updateOnboarding } from '../../store/slices/tripSlice'
import DestinationCard from '../../components/Cards/DestinationCard'
import Button from '../../components/UI/Button'
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

  // Editor's pick — first destination (or use a designated featured flag if you add one later)
  const featuredDest = !hasFilters ? destinationsDatabase[0] : null
  const restOfDestinations = featuredDest
    ? filteredDestinations.filter(d => d.id !== featuredDest.id)
    : filteredDestinations

  // Quick filter suggestions
  const popularInterests = ['Beach', 'Cultural', 'Adventure', 'Food', 'Nature']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO — editorial weight */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white pt-24 md:pt-28 pb-16 md:pb-20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl"
        />

        <div className="container-custom relative">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 mb-3">
              Discover
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              {destinationsDatabase.length} destinations,{' '}
              <span className="text-amber-300">hand-picked.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary-100 max-w-2xl leading-relaxed">
              Browse the catalog or search for places, interests, or activities. Click any
              destination to start a planning session with smart defaults.
            </p>
          </div>
        </div>
      </section>

      {/* STICKY SEARCH BAR */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destinations, interests, activities..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none text-sm transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category chips — scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0 -mx-2 px-2 lg:mx-0 lg:px-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-800 text-white border-primary-800 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Popular interests — only when no filters active */}
          {!hasFilters && (
            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 font-medium">Popular:</span>
              {popularInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => setSearchTerm(interest)}
                  className="text-slate-600 hover:text-primary-700 hover:underline underline-offset-4 transition-colors"
                >
                  {interest}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div className="container-custom py-10">
        {filteredDestinations.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              No matches for "{searchTerm || selectedCategory}"
            </h3>
            <p className="mt-3 text-slate-600">
              Try a different search term, or plan a custom trip to anywhere in the world.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={handleClearFilters}>
                Clear filters
              </Button>
              <Button variant="outline" icon={Sparkles} onClick={() => navigate('/plan')}>
                Plan a custom trip
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{filteredDestinations.length}</span>{' '}
                destination{filteredDestinations.length !== 1 ? 's' : ''}
                {hasFilters ? ' matching your filters' : ''}
              </p>
            </div>

            {/* FEATURED CARD — only when no filters */}
            {featuredDest && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                    Editor's pick
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </span>
                </div>

                <div
                  onClick={() => handlePersonalize(featuredDest)}
                  className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-primary-200 transition-all duration-300"
                >
                  <div className="md:grid md:grid-cols-12">
                    <div className="md:col-span-7 h-64 md:h-auto relative overflow-hidden bg-slate-200">
                      {featuredDest.image ? (
                        <img
                          src={featuredDest.image}
                          alt={featuredDest.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full">
                          {featuredDest.category}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-5 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight group-hover:text-primary-800 transition-colors">
                          {featuredDest.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 font-medium">
                          {featuredDest.subtitle}
                        </p>

                        <p className="mt-4 text-slate-600 leading-relaxed">
                          {featuredDest.highlight}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm">
                          <div className="inline-flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {featuredDest.duration}
                          </div>
                          <div className="inline-flex items-center gap-1.5 text-slate-600">
                            <span className="text-slate-400">$</span>
                            ~${featuredDest.budget}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button variant="primary" icon={ArrowRight} iconPosition="right">
                          Start planning
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN GRID */}
            {restOfDestinations.length > 0 && (
              <>
                {featuredDest && (
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    More to explore
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restOfDestinations.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      {...destination}
                      onClick={() => handlePersonalize(destination)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Bottom CTA — small, soft */}
            <div className="mt-16 bg-gradient-to-br from-slate-100 to-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-3">
                Not seeing your destination?
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Plan a trip to anywhere in the world.
              </h3>
              <p className="mt-3 text-slate-600 max-w-xl mx-auto">
                The catalog has {destinationsDatabase.length} curated picks, but Auriva works for
                any city or region. Type your own and start planning.
              </p>
              <div className="mt-6">
                <Button variant="primary" icon={Sparkles} iconPosition="right" onClick={() => navigate('/plan')}>
                  Plan a custom trip
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage
