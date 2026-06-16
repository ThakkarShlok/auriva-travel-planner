import React, { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useSelector } from 'react-redux'
import { saveTrip } from '../../services/tripsService'
import { storage } from '../../services/localStorageService'

const DISMISSED_KEY = 'auriva_migration_dismissed'

const LocalStorageMigrationBanner = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { savedTrips, tripsLoading } = useSelector(state => state.trip)
  const [localTrips, setLocalTrips] = useState(null)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (tripsLoading || !user?.id) return
    // Only check once DB trips have loaded and user has none
    if (savedTrips.length > 0) return
    if (storage.get(DISMISSED_KEY)) return

    const key = storage.getTripsKey(user.id)
    const stored = storage.get(key)
    if (Array.isArray(stored) && stored.length > 0) {
      setLocalTrips(stored)
    }
  }, [tripsLoading, savedTrips.length, user?.id])

  if (!localTrips || done) return null

  const handleImport = async () => {
    setImporting(true)
    try {
      for (const trip of localTrips) {
        // Map old localStorage shape to the new { preferences, generated } contract
        const budgetLevel = typeof trip.budget === 'string' ? trip.budget : 'moderate'
        const budgetBreakdown = typeof trip.budget === 'object' ? trip.budget : null
        await saveTrip({
          preferences: {
            destination: trip.destination || 'Unknown',
            duration: trip.duration || trip.preferences?.duration || 3,
            travelers: trip.travelers || trip.preferences?.travelers || 1,
            budget: budgetLevel,
            interests: trip.interests || trip.preferences?.interests || null,
          },
          generated: {
            overview: trip.overview || null,
            days: trip.days || [],
            budget: budgetBreakdown,
            hotels: trip.hotels || [],
            packing: trip.packing || [],
            tips: trip.tips || [],
          },
        }, getToken)
      }
      // Clear the localStorage key so this never re-triggers
      storage.remove(storage.getTripsKey(user.id))
      setDone(true)
      window.location.reload() // Reload so Redux re-fetches with the imported trips
    } catch (err) {
      console.error('[migration]', err.message)
      setImporting(false)
    }
  }

  const handleDismiss = () => {
    storage.set(DISMISSED_KEY, true)
    setLocalTrips(null)
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 mb-6">
      <p className="text-sm text-primary-800">
        Found <span className="font-semibold">{localTrips.length} saved trip{localTrips.length !== 1 ? 's' : ''}</span> from before. Import them to your account?
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleImport}
          disabled={importing}
          className="text-sm px-3 py-1.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-sm px-3 py-1.5 text-slate-500 hover:text-slate-700 transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default LocalStorageMigrationBanner
