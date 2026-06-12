import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateOnboarding } from '../../store/slices/tripSlice'
import usePageTitle from '../../hooks/usePageTitle'
import { Sparkles, MapPin, Compass, ArrowRight } from 'lucide-react'
import destinationsDatabase from '../../constants/destinations'
import Button from '../../components/UI/Button'
import Section from '../../components/UI/Section'
import Card from '../../components/UI/Card'
import StatsBand from '../../components/UI/StatsBand'
import FeatureGrid from '../../components/UI/FeatureGrid'
import GradientCTA from '../../components/UI/GradientCTA'
import DestinationCard from '../../components/Cards/DestinationCard'

const HomePage = () => {
  usePageTitle(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  const featuredDestinations = destinationsDatabase.slice(0, 6)

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Personalized to you',
      description: 'Tell us your style, pace, and budget. Get an itinerary built around how you actually travel.',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Real places, not vibes',
      description: 'Every recommendation is a specific restaurant, hotel, or landmark — never a generic "try local food".',
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: 'Day-by-day clarity',
      description: 'Morning, afternoon, evening. Costs, durations, tips. You\'ll know exactly what each day looks like.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Tell us where',
      description: 'Pick a destination or browse our trending picks.',
    },
    {
      number: '2',
      title: 'Share your style',
      description: 'Budget, pace, interests, travelers. Quick form, big impact.',
    },
    {
      number: '3',
      title: 'Get your trip',
      description: 'A complete day-by-day plan with real recommendations. Save it, edit it, share it.',
    },
  ]

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

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="hero-gradient min-h-[600px] flex items-center pt-16 md:pt-20">
        <div className="container-custom py-16 md:py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-POWERED TRAVEL
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Plan your perfect trip in seconds, not weeks.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-100 max-w-2xl">
              Auriva crafts personalized day-by-day itineraries with real places, real prices, and real recommendations — powered by AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/plan')}>
                Start planning
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border border-white/30 hover:bg-white/10 hover:text-white"
                onClick={() => navigate('/discover')}
              >
                Explore destinations
              </Button>
            </div>
            <div className="mt-12 text-primary-200 text-sm flex items-center gap-6 flex-wrap">
              <span>✓ Free to use</span>
              <span>✓ No signup required to try</span>
              <span>✓ Save trips when logged in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Auriva */}
      <Section bg="white">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3">WHY AURIVA</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Travel planning that actually plans.
          </h2>
        </div>
        <FeatureGrid features={features} columns={3} />
      </Section>

      {/* Trending Destinations */}
      <Section bg="slate">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3">TRENDING DESTINATIONS</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Where travelers are going.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              {...dest}
              onClick={() => handlePersonalize(dest)}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="ghost" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/discover')}>
            See all {destinationsDatabase.length} destinations
          </Button>
        </div>
      </Section>

      {/* Stats */}
      <StatsBand
        variant="light"
        stats={[
          { value: `${destinationsDatabase.length}+`, label: 'Destinations curated' },
          { value: '<10s', label: 'To generate an itinerary' },
          { value: 'Free', label: 'Always, no trials' },
          { value: 'AI', label: 'Powered by Groq' },
        ]}
      />

      {/* How it works */}
      <Section bg="slate">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            From idea to itinerary in three steps.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} padding="lg">
              <div className="text-5xl font-bold text-primary-800 mb-2">{step.number}</div>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{step.title}</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <GradientCTA
        title="Ready to plan something memorable?"
        description="Free to try. No signup needed. Your itinerary is one form away."
        primaryAction={{ label: 'Start planning', to: '/plan' }}
        secondaryAction={{ label: 'Explore destinations', to: '/discover' }}
      />
    </div>
  )
}

export default HomePage
