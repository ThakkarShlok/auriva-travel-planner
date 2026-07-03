import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateOnboarding } from '../../store/slices/tripSlice'
import { MapPin, Calendar, ArrowRight, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import PageHeader from '../../components/UI/PageHeader'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const INTEREST_CHIPS = ['Culture', 'Food', 'Adventure', 'Nature', 'Relaxation', 'Nightlife', 'Family-friendly', 'Photography']

const BUDGET_OPTIONS = [
  { value: 'budget',   label: 'Budget',   hint: 'Backpacker · ~$50/day' },
  { value: 'moderate', label: 'Moderate', hint: 'Comfortable · ~$150/day' },
  { value: 'luxury',   label: 'Luxury',   hint: 'Premium · ~$400/day' },
]

const OnboardingPage = () => {
  usePageTitle('Plan Your Trip')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.auth)

  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState(3)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('moderate')
  const [selectedInterests, setSelectedInterests] = useState([])
  const [customInterests, setCustomInterests] = useState('')

  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      if (diff > 0) setDuration(diff)
    }
  }, [startDate, endDate])

  const toggleInterest = (chip) => {
    setSelectedInterests(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      toast.error('Please enter a destination')
      return
    }
    if (!startDate) {
      toast.error('Please select a start date for your trip')
      return
    }
    const interestsList = [
      ...selectedInterests,
      ...customInterests.split(',').map(s => s.trim()).filter(Boolean),
    ]
    dispatch(updateOnboarding({
      destination: destination.trim(),
      startDate,
      endDate,
      duration,
      travelers,
      budget,
      interests: interestsList.join(', '),
    }))
    navigate(isAuthenticated ? '/planner' : '/login', isAuthenticated ? undefined : { state: { from: { pathname: '/planner' } } })
  }

  const filledCount = [
    destination.trim() !== '',
    startDate !== '',
    endDate !== '',
    budget !== 'moderate',
    selectedInterests.length > 0 || customInterests.trim() !== '',
  ].filter(Boolean).length

  const totalFields = 5

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="default"
          eyebrow="STEP 1 OF 2"
          title="Tell us about your trip"
          description="We'll use this to craft your personalized itinerary."
        />
      </div>

      <div className="container-custom max-w-3xl mx-auto py-10">
        <Card padding="lg">
          {/* Form completion progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Trip details</span>
              <span>{filledCount} of {totalFields} filled</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-700 rounded-full transition-all duration-300"
                style={{ width: `${(filledCount / totalFields) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Where do you want to go?
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Paris, Tokyo, New York..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Tip: a specific city gets the most accurate weather forecast (e.g. "Gangtok" works better than "Sikkim").
              </p>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">When are you going?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              {startDate && endDate && duration > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-primary-50 text-primary-800 text-sm font-semibold px-4 py-2 rounded-full">
                  Trip length: {duration} {duration === 1 ? 'day' : 'days'}
                </div>
              )}
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Who's going?</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTravelers(t => Math.max(1, t - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xl font-bold w-8 text-center text-slate-900">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers(t => Math.min(20, t + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-slate-500 text-sm">{travelers === 1 ? 'traveler' : 'travelers'}</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">What's your budget?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      budget === opt.value
                        ? 'border-primary-800 bg-primary-50'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={opt.value}
                      className="sr-only"
                      checked={budget === opt.value}
                      onChange={() => setBudget(opt.value)}
                    />
                    <span className={`font-semibold ${budget === opt.value ? 'text-primary-800' : 'text-slate-900'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">{opt.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What kind of experiences?
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {INTEREST_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleInterest(chip)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      selectedInterests.includes(chip)
                        ? 'bg-primary-800 text-white border-primary-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={customInterests}
                onChange={(e) => setCustomInterests(e.target.value)}
                placeholder="Anything specific? (e.g. wine tasting, street photography, hiking...)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none text-sm resize-none"
              />
            </div>

            <div>
              <Button type="submit" variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="right">
                Generate my itinerary
              </Button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Generation takes about 8–12 seconds. We'll show you what we're cooking up.
              </p>
              {!isAuthenticated && (
                <p className="text-center text-sm text-slate-500 mt-2">
                  You'll be asked to sign in before viewing your itinerary.
                </p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default OnboardingPage
