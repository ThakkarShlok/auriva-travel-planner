import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Compass, Calendar, LayoutDashboard, Menu, X, Sparkles, LogOut, Info, Mail, ChevronDown, Globe } from 'lucide-react'
import { logoutUser } from '../../store/authSlice'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { savedTrips } = useSelector(state => state.trip)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: Compass },
    { path: '/plan', label: 'Plan Trip', icon: Calendar },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: savedTrips?.length },
    { path: '/discover', label: 'Discover', icon: Globe },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white shadow-soft border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-800 tracking-tight">
                Auriva
              </span>
              <span className="text-[10px] text-gray-400 tracking-wider -mt-1">AI TRAVEL</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 bg-secondary-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {link.badge}
                    </span>
                  )}
                </div>
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-600 hidden lg:block">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>My Trips</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-primary-600 transition font-medium">Login</Link>
                <Link to="/register" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  location.pathname === link.path ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
                {link.badge > 0 && <span className="ml-auto bg-secondary-500 text-white text-xs rounded-full px-2 py-0.5">{link.badge}</span>}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to="/login" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">Login</Link>
                <Link to="/register" className="block px-4 py-3 bg-primary-600 text-white rounded-lg mt-2 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar