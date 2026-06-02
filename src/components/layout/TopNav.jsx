import { Link, NavLink } from 'react-router-dom'
import AppRoutes from '../../constants/routes.js'
import { useSelector } from 'react-redux'
import Button from '../ui/Button.jsx'

function TopNav() {
  const auth = useSelector((state) => state.auth)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link to={AppRoutes.home} className="inline-flex items-center gap-3 text-lg font-semibold text-ink-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">T</span>
          <span>Travello AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to={AppRoutes.home} className={({ isActive }) => isActive ? 'text-ink-900 font-semibold' : 'text-slate-600 hover:text-ink-900'}>Home</NavLink>
          <NavLink to={AppRoutes.discover} className={({ isActive }) => isActive ? 'text-ink-900 font-semibold' : 'text-slate-600 hover:text-ink-900'}>Discover</NavLink>
          <NavLink to={AppRoutes.plan} className={({ isActive }) => isActive ? 'text-ink-900 font-semibold' : 'text-slate-600 hover:text-ink-900'}>Plan</NavLink>
          <NavLink to={AppRoutes.dashboard} className={({ isActive }) => isActive ? 'text-ink-900 font-semibold' : 'text-slate-600 hover:text-ink-900'}>Saved trips</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {auth.isAuthenticated ? (
            <Link to={AppRoutes.dashboard} className="text-sm font-semibold text-ink-900">Dashboard</Link>
          ) : (
            <Link to={AppRoutes.login} className="text-sm font-semibold text-ink-900">Login</Link>
          )}
          <Link to={AppRoutes.plan}>
            <Button type="button">Start planning</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default TopNav
