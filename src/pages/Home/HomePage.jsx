import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateOnboarding } from '../../store/slices/tripSlice'
import { 
  Search, MapPin, Calendar, Users, TrendingUp, Shield, Clock, 
  Sparkles, ChevronRight, Star, Quote, Globe, Heart, Coffee, 
  Camera, Mountain, Award, Compass, Sun, Plane, Hotel, DollarSign,
  CheckCircle
} from 'lucide-react'
import destinationsDatabase from '../../constants/destinations'

const HomePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchDestination, setSearchDestination] = useState('')

  const featuredDestinations = destinationsDatabase.slice(0, 6)

  const reviews = [
    { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'Auriva planned our perfect Bali trip! The itinerary was spot-on and saved us hours of research.', avatar: 'P', date: '2 weeks ago' },
    { name: 'Rahul Mehta', location: 'Delhi', rating: 5, text: 'Best travel planning experience ever. The AI recommendations were incredibly accurate.', avatar: 'R', date: '1 month ago' },
    { name: 'Anjali Patel', location: 'Bangalore', rating: 5, text: 'From Paris to Tokyo, Auriva made every trip unforgettable. Highly recommended!', avatar: 'A', date: '3 weeks ago' },
    { name: 'Vikram Singh', location: 'Jaipur', rating: 5, text: 'Great platform! The packing lists and budget breakdowns were super helpful.', avatar: 'V', date: '1 week ago' },
  ]

  const features = [
    { icon: Sparkles, title: 'AI-Powered Planning', description: 'Smart itineraries tailored to your preferences', iconColor: 'text-primary-600' },
    { icon: Shield, title: 'Best Price Guarantee', description: 'We find you the best deals available', iconColor: 'text-primary-600' },
    { icon: Clock, title: '24/7 AI Support', description: 'Instant answers anytime, anywhere', iconColor: 'text-primary-600' },
  ]

  const stats = [
    { value: '10K+', label: 'Happy Travelers', icon: Users },
    { value: '50+', label: 'Destinations', icon: Globe },
    { value: '4.9★', label: 'Average Rating', icon: Star },
    { value: '24/7', label: 'AI Support', icon: Clock },
  ]

  const travelBenefits = [
    { icon: CheckCircle, title: 'Personalized Itineraries', description: 'Tailored to your preferences and budget' },
    { icon: CheckCircle, title: 'Local Expert Tips', description: 'Hidden gems and authentic experiences' },
    { icon: CheckCircle, title: 'Smart Budgeting', description: 'Real-time cost breakdowns' },
    { icon: CheckCircle, title: 'Easy Planning', description: 'Save, edit, and share your trips' },
  ]

  const handlePersonalize = (destination) => {
    dispatch(updateOnboarding({
      destination: destination.title,
      duration: parseInt(destination.duration.split('-')[0]) || 5,
      budget: destination.budget,
      interests: destination.interests,
      travelers: 2
    }))
    navigate('/planner')
  }

  const handleSearch = () => {
    if (searchDestination) {
      navigate(`/discover?search=${encodeURIComponent(searchDestination)}`)
    } else {
      navigate('/discover')
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Professional Navy Gradient */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container-custom py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span>AI-Powered Travel Planning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Your Personal AI
              <span className="text-white block">Travel Strategist</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Create personalized, expert-crafted itineraries in seconds. Save hours of planning and discover experiences tailored just for you.
            </p>

            {/* Search Bar - Clean White */}
            <div className="bg-white rounded-2xl p-2 shadow-xl mx-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Where to? (e.g., Paris, Goa, Switzerland)"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-gray-800"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="date" className="w-full md:w-40 pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-gray-800" />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select className="w-full md:w-32 pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-gray-800">
                    <option>1 Traveler</option><option>2 Travelers</option><option>3 Travelers</option><option>4+ Travelers</option>
                  </select>
                </div>
                <button onClick={handleSearch} className="bg-primary-700 text-white font-medium px-6 py-3 rounded-xl hover:bg-primary-800 transition w-full md:w-auto">
                  Explore Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Clean White */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Popular Destinations</h2>
              <p className="text-gray-500 mt-1">Hand-picked destinations, ready to personalize</p>
            </div>
            <Link to="/discover" className="text-sm text-primary-600 flex items-center gap-2 hover:gap-3 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((dest) => (
              <div key={dest.id} className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => handlePersonalize(dest)}>
                <div className="h-48 overflow-hidden relative">
                  <img src={dest.image} alt={dest.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
                    {dest.duration}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{dest.title}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-600">{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{dest.subtitle}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{dest.budget}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{dest.category}</span>
                  </div>
                  <button className="w-full bg-primary-50 text-primary-700 py-2 rounded-lg font-medium hover:bg-primary-100 transition">
                    Personalize This Trip →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Benefits Section - Instead of Google Maps */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                Why Travelers Love Us
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Smart Travel Planning Made Simple</h2>
              <p className="text-gray-600 mb-6">
                Auriva combines cutting-edge AI with local expertise to create personalized itineraries that save you time and money.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {travelBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <benefit.icon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{benefit.title}</h4>
                      <p className="text-sm text-gray-500">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/plan">
                <button className="mt-8 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition">
                  Start Planning Now
                </button>
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-gray-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Plane className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">50+</div>
                  <div className="text-xs text-gray-500">Destinations</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Hotel className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">10K+</div>
                  <div className="text-xs text-gray-500">Happy Travelers</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">30%</div>
                  <div className="text-xs text-gray-500">Average Savings</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Sun className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">24/7</div>
                  <div className="text-xs text-gray-500">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Auriva</h2>
            <p className="text-gray-500">The smarter way to plan your travels</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-card hover:shadow-hover transition">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Quote className="w-4 h-4" />
              Testimonials
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Travelers Say About Auriva</h2>
            <p className="text-gray-500">Join thousands of happy travelers who planned their trips with us</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 shadow-card hover:shadow-hover transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                <p className="text-xs text-gray-400 mt-3">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Inspiration Section - Beautiful Grid */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Travel Inspiration</h2>
            <p className="text-primary-200">Explore amazing destinations and start planning your dream vacation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adventure Travel</h3>
              <p className="text-primary-200 text-sm">Discover thrilling experiences in the world's most exciting destinations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Photography Tours</h3>
              <p className="text-primary-200 text-sm">Capture stunning moments at the most picturesque locations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cultural Experiences</h3>
              <p className="text-primary-200 text-sm">Immerse yourself in local traditions and authentic experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">Join thousands of travelers using Auriva to plan their perfect trips</p>
          <Link to="/plan">
            <button className="bg-white text-primary-700 px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Plan Your Trip Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage