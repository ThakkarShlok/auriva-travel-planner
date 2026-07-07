import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatBot from '../ChatBot/ChatBot'
import { clearSavedTrips } from '../../store/slices/tripSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Clear cached trips from Redux when the user signs out.
  // Trip loading on sign-in is handled by ClerkSyncBridge (fetchSavedTrips).
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearSavedTrips())
    }
  }, [isAuthenticated, dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default Layout
