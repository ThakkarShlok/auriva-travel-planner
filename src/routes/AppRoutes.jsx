import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/LandingPage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx'
import OnboardingPage from '../pages/onboarding/OnboardingPage.jsx'
import PlannerPage from '../pages/planner/PlannerPage.jsx'
import DiscoverPage from '../pages/discover/DiscoverPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import PrivateRoute from './PrivateRoute.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/plan" element={<OnboardingPage />} />
      <Route
        path="/planner"
        element={
          <PrivateRoute>
            <PlannerPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
