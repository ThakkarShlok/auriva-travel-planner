import { useEffect, useRef } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { setUser, clearUser } from '../store/authSlice'
import { setTokenGetter } from '../store'
import { fetchSavedTrips } from '../store/slices/tripSlice'

const ClerkSyncBridge = () => {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const syncedUserIdRef = useRef(null)

  // Keep Redux tokenGetter current whenever getToken identity changes
  useEffect(() => {
    setTokenGetter(getToken)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      const payload = {
        id: user.id,
        name: user.fullName
          || [user.firstName, user.lastName].filter(Boolean).join(' ')
          || user.primaryEmailAddress?.emailAddress
          || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null,
      }
      dispatch(setUser(payload))

      if (syncedUserIdRef.current !== user.id) {
        syncedUserIdRef.current = user.id

        // JIT sync to Neon — fires once per unique user ID per session
        fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            imageUrl: payload.imageUrl,
          }),
        }).catch(err => {
          console.warn('[ClerkSyncBridge] sync-user failed:', err.message)
        })

        // Load this user's saved trips from Neon
        dispatch(fetchSavedTrips())
      }
    } else {
      syncedUserIdRef.current = null
      dispatch(clearUser())
    }
  }, [isLoaded, isSignedIn, user?.id, dispatch])

  return null
}

export default ClerkSyncBridge
