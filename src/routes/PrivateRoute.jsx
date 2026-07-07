import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import Loader from '../components/ui/Loader'

const PrivateRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  // Clerk hasn't initialised yet — show fullscreen loader to prevent flash-redirect
  if (!isLoaded) {
    return <Loader fullScreen />
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
