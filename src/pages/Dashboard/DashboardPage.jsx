import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeTrip, cloneTrip } from '../../store/slices/tripSlice'
import { Compass, Plus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../../hooks/usePageTitle'
import PageHeader from '../../components/UI/PageHeader'
import StatsBand from '../../components/UI/StatsBand'
import Button from '../../components/UI/Button'
import EmptyState from '../../components/UI/EmptyState'
import TripCard from '../../components/Cards/TripCard'
import SkeletonCard from '../../components/UI/SkeletonCard'
import LocalStorageMigrationBanner from '../../components/Migration/LocalStorageMigrationBanner'
import destinationsDatabase from '../../constants/destinations'

const DashboardPage = () => {
  usePageTitle('My Trips')
  const { savedTrips, tripsLoading, tripsError } = useSelector(state => state.trip)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDelete = (trip) => {
    if (!window.confirm(`Delete "${trip.destination || 'this trip'}"? This cannot be undone.`)) return
    dispatch(removeTrip(trip.id))
      .unwrap()
      .then(() => toast.success('Trip deleted.'))
      .catch((err) => toast.error(err || 'Failed to delete trip'))
  }

  const handleDuplicate = (tripId) => {
    dispatch(cloneTrip(tripId))
      .unwrap()
      .then(() => toast.success('Trip duplicated.'))
      .catch((err) => toast.error(err || 'Failed to duplicate trip'))
  }

  const handleView = (trip) => {
    navigate(`/itinerary/${trip.id}`)
  }

  const getDestImage = (trip) => {
    const match = destinationsDatabase.find(
      d => d.title.toLowerCase().includes((trip.destination || '').toLowerCase().split(',')[0])
    )
    return match?.image || null
  }

  const totalCost = savedTrips.reduce((sum, trip) => {
    if (!trip.budgetBreakdown || typeof trip.budgetBreakdown !== 'object') return sum
    return sum + Object.values(trip.budgetBreakdown).reduce((a, b) => a + b, 0)
  }, 0)

  const uniqueDestinations = new Set(savedTrips.map(t => t.destination).filter(Boolean)).size

  const stats = [
    { value: savedTrips.length.toString(), label: 'Total trips' },
    { value: '0', label: 'Upcoming' },
    { value: totalCost > 0 ? `$${totalCost.toLocaleString()}` : '—', label: 'Total budgeted' },
    { value: uniqueDestinations.toString(), label: 'Destinations' },
  ]

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
        <LocalStorageMigrationBanner />

        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} showHeader lines={4} />)}
          </div>
        ) : tripsError ? (
          <EmptyState
            icon={AlertCircle}
            title="Failed to load trips"
            description={tripsError}
            action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>}
          />
        ) : savedTrips.length === 0 ? (
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
