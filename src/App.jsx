// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import PrivateRoute from './routes/PrivateRoute'
import Loader from './components/ui/Loader'
import ClerkSyncBridge from './components/ClerkSyncBridge'

// Lazy load pages
const HomePage = lazy(() => import('./pages/Home/HomePage'))
const OnboardingPage = lazy(() => import('./pages/Onboarding/OnboardingPage'))
const PlannerPage = lazy(() => import('./pages/Planner/PlannerPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const ItineraryDetailPage = lazy(() => import('./pages/ItineraryDetail/ItineraryDetailPage'))
const AboutPage = lazy(() => import('./pages/About/AboutPage'))
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DiscoverPage = lazy(() => import('./pages/Discover/DiscoverPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PublicTripPage = lazy(() => import('./pages/PublicTrip/PublicTripPage'))
const AdminMetricsPage = lazy(() => import('./pages/Admin/AdminMetricsPage'))

function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <ClerkSyncBridge />
      <Routes>
        {/* Auth routes — /* suffix lets Clerk handle multi-step flows (verification, OAuth callbacks) */}
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/register/*" element={<RegisterPage />} />

        {/* Main routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="plan" element={<OnboardingPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="share/:slug" element={<PublicTripPage />} />
          {/* Not wrapped in PrivateRoute — AdminMetricsPage does its own sign-in + admin-email check */}
          <Route path="admin/metrics" element={<AdminMetricsPage />} />

          {/* Protected routes */}
          <Route path="planner" element={
            <PrivateRoute>
              <PlannerPage />
            </PrivateRoute>
          } />
          <Route path="dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="itinerary/:id" element={
            <PrivateRoute>
              <ItineraryDetailPage />
            </PrivateRoute>
          } />

          {/* Catch-all 404 inside Layout */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
