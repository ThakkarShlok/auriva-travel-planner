import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Compass, Calendar, LayoutDashboard, Menu, X, Sparkles, Info, Mail, Globe } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { savedTrips } = useSelector(state => state.trip)
  const { currency, setCurrency } = useCurrency()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            <div className="w-9 h-9 bg-primary-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-800 tracking-tight">Auriva</span>
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
                  link.path === '/plan'
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : location.pathname === link.path
                      ? 'text-primary-800 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 bg-accent-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {link.badge}
                    </span>
                  )}
                </div>
                {location.pathname === link.path && link.path !== '/plan' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-800 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-primary-800 transition font-medium">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition shadow-sm">
                  Sign Up
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="hidden md:flex items-center gap-1 mr-3 bg-slate-100 rounded-full p-0.5">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                    currency === 'INR' ? 'bg-white text-primary-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                    currency === 'USD' ? 'bg-white text-primary-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  $ USD
                </button>
              </div>
              <UserButton
                appearance={{ elements: { avatarBox: 'w-9 h-9' } }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
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
                  location.pathname === link.path ? 'bg-primary-50 text-primary-800' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <SignedOut>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-primary-800 text-white rounded-lg mt-2 text-center"
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
