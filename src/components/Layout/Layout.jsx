import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatBot from '../ChatBot/ChatBot'
import { loadUserTrips, clearSavedTrips } from '../../store/slices/tripSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUserTrips())
    } else {
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
