import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteTrip, duplicateTrip } from '../../store/slices/tripSlice'
import { Compass, Plus, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import PageHeader from '../../components/UI/PageHeader'
import StatsBand from '../../components/UI/StatsBand'
import Button from '../../components/UI/Button'
import EmptyState from '../../components/UI/EmptyState'
import TripCard from '../../components/Cards/TripCard'
import destinationsDatabase from '../../constants/destinations'

const DashboardPage = () => {
  usePageTitle('My Trips')
  const { savedTrips } = useSelector(state => state.trip)
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDelete = (trip) => {
    if (!window.confirm(`Delete "${trip.destination || 'this trip'}"? This cannot be undone.`)) return
    dispatch(deleteTrip(trip.id))
    toast.success('Trip deleted.')
  }

  const handleDuplicate = (tripId) => {
    dispatch(duplicateTrip(tripId))
    toast.success('Trip duplicated.')
  }

  const handleView = (trip) => {
    navigate(`/itinerary/${trip.id}`, { state: { trip } })
  }

  const getDestImage = (trip) => {
    const match = destinationsDatabase.find(
      d => d.title.toLowerCase().includes((trip.destination || '').toLowerCase().split(',')[0])
    )
    return match?.image || null
  }

  const totalCost = savedTrips.reduce((sum, trip) => {
    if (!trip.budget || typeof trip.budget !== 'object') return sum
    return sum + Object.values(trip.budget).reduce((a, b) => a + b, 0)
  }, 0)

  const uniqueDestinations = new Set(savedTrips.map(t => t.destination).filter(Boolean)).size

  const stats = [
    { value: savedTrips.length.toString(), label: 'Total trips' },
    { value: '0', label: 'Upcoming' },
    { value: totalCost > 0 ? `$${totalCost.toLocaleString()}` : '—', label: 'Total budgeted' },
    { value: uniqueDestinations.toString(), label: 'Destinations' },
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20 flex items-center justify-center">
        <div className="container-custom max-w-md text-center">
          <EmptyState
            icon={Lock}
            title="Login required"
            description="Please sign in to view your saved trips."
            action={<Button variant="primary" onClick={() => navigate('/login')}>Sign in</Button>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pt-20">
        <PageHeader
          variant="default"
          eyebrow="MY TRIPS"
          title="Your saved itineraries"
          actions={
            <Button variant="accent" icon={Plus} onClick={() => navigate('/plan')}>
              Plan new trip
            </Button>
          }
        />
      </div>

      <StatsBand variant="light" stats={stats} />

      <div className="container-custom py-10">
        {savedTrips.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No trips yet"
            description="Start planning your first adventure."
            action={<Button variant="primary" onClick={() => navigate('/plan')}>Plan a trip</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                image={getDestImage(trip)}
                onView={() => handleView(trip)}
                onDelete={() => handleDelete(trip)}
                onDuplicate={() => handleDuplicate(trip.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
