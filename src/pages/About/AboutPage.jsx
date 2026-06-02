import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Globe, Users, Star, Heart, Zap, Sparkles,
  ChevronRight, Rocket, Shield, Github, Linkedin, Mail,
  Target, Coffee, BookOpen, Calendar, Eye
} from 'lucide-react';
import founderPhoto from '../../assets/Professional Photo (5).png';

const AboutPage = () => {
  const stats = [
    { value: '10,000+', label: 'Happy Travelers', icon: Users, desc: 'From 50+ countries' },
    { value: '50+', label: 'Destinations', icon: Globe, desc: 'Across 6 continents' },
    { value: '4.9★', label: 'Average Rating', icon: Star, desc: 'From real travelers' },
    { value: '24/7', label: 'AI Support', icon: Shield, desc: 'Always here to help' },
  ];

  const values = [
    { title: 'Traveler First', description: 'Every feature starts with your journey. No gimmicks, just genuine help.', icon: Heart },
    { title: 'AI Powered', description: 'Cutting-edge technology that delivers personalized recommendations.', icon: Sparkles },
    { title: 'Blazing Fast', description: 'Itineraries in seconds, not hours. Plan more, wait less.', icon: Zap },
    { title: 'Always Improving', description: 'We ship updates weekly based on user feedback.', icon: Rocket },
  ];

  // Journey timeline with past, present, and future
  const journeyMilestones = [
    { year: '2024', title: 'The Beginning', description: 'Auriva founded with a mission to transform travel planning', status: 'completed', icon: '🚀' },
    { year: '2024', title: 'AI Integration', description: 'Successfully integrated Groq AI for smart itinerary generation', status: 'completed', icon: '🤖' },
    { year: '2025', title: 'Public Launch', description: 'Opened to travelers worldwide, serving 10,000+ users', status: 'completed', icon: '🌍' },
    { year: '2026', title: 'Mobile App Launch', description: 'iOS and Android apps for on-the-go planning', status: 'current', icon: '📱' },
    { year: '2027', title: 'Global Expansion', description: 'Expand to 100+ countries with local partnerships', status: 'planned', icon: '🌎' },
    { year: '2028', title: 'AI Travel Agent', description: 'Fully automated booking and real-time assistance', status: 'planned', icon: '✨' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container-custom relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              About Auriva
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Journey,
              <span className="text-primary-300 block">Our Passion</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Auriva is making travel planning effortless with AI that actually understands you.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-md transition group">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <BookOpen className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Born from a Vision to Transform Travel</h2>
            <p className="text-gray-600 text-lg">
              Every great journey begins with a single step — or in this case, a frustrating travel planning experience.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 text-gray-600 leading-relaxed">
            <p>
              <strong className="text-primary-600">In 2024</strong>, our founder Shlok Thakkar, a passionate Computer Engineering student, 
              faced the same problem millions of travelers face: planning a trip was <strong>overwhelming</strong>. 
              Endless tabs, confusing recommendations, and hours of research — there had to be a better way.
            </p>
            <p>
              That's when the vision for <strong className="text-primary-600">Auriva</strong> was born — an AI-powered 
              travel strategist that generates personalized itineraries in <strong>seconds, not hours</strong>. 
              What started as a passion project quickly grew into a platform trusted by thousands of travelers worldwide.
            </p>
            <p>
              Today, Auriva is helping travelers explore <strong>50+ countries</strong> with confidence. 
              We're continuously improving our AI, adding new features, and working towards making 
              travel planning truly effortless for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Making Travel Planning Effortless for Everyone</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We believe that planning a trip should be as exciting as the journey itself. 
                  That's why we're building AI that actually understands your preferences, budget, and travel style.
                </p>
                <p>
                  Whether you're a solo backpacker, a couple on a romantic getaway, or a family planning a vacation, 
                  Auriva creates personalized itineraries that save you hours of research and help you discover authentic experiences.
                </p>
              </div>
              <Link to="/plan" className="inline-flex items-center gap-2 mt-6 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-md">
                Start Your Journey
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Promise</h3>
              <p className="text-gray-600 italic leading-relaxed">
                "Every feature we build is driven by one goal: to make your travel planning 
                feel less like work and more like discovery — personalized, intelligent, and genuinely helpful."
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-primary-700 font-medium">— The Auriva Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline with Future Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              Our Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">The Road Ahead</h2>
            <p className="text-gray-600 text-lg">From past achievements to future ambitions — our journey continues</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 transform -translate-x-1/2 hidden md:block"></div>
              
              {journeyMilestones.map((milestone, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row gap-6 mb-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:text-right">
                    <div className={`p-6 rounded-xl shadow-md ${
                      milestone.status === 'completed' ? 'bg-green-50 border-l-4 border-green-500' :
                      milestone.status === 'current' ? 'bg-primary-50 border-l-4 border-primary-500' :
                      'bg-gray-100 border-l-4 border-gray-400'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{milestone.icon}</span>
                        <span className={`text-sm font-bold ${
                          milestone.status === 'completed' ? 'text-green-600' :
                          milestone.status === 'current' ? 'text-primary-600' :
                          'text-gray-500'
                        }`}>
                          {milestone.year}
                          {milestone.status === 'current' && ' • Currently Working On'}
                          {milestone.status === 'planned' && ' • Coming Soon'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-6 transform md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10 ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'current' ? 'bg-primary-500' :
                    'bg-gray-400'
                  }">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-2 text-sm">
              <Eye className="w-4 h-4" />
              Our vision extends beyond — we're just getting started!
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                <Users className="w-4 h-4" />
                Meet the Founder
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Built by a Team That Cares</h2>
              <p className="text-gray-600 text-lg">Here's who's behind Auriva</p>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <div className="md:flex">
                <div className="md:w-2/5 bg-gray-50 p-8 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-primary-200 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-white rounded-2xl p-2 shadow-md">
                      <img
                        src={founderPhoto}
                        alt="Shlok Thakkar - Founder"
                        className="w-full max-w-[280px] h-auto rounded-xl object-cover"
                        style={{ aspectRatio: '4/5' }}
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=Shlok+Thakkar&background=55709c&color=fff&size=200';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                      Founder & CEO
                    </div>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-8 md:p-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Shlok Thakkar</h3>
                  <p className="text-primary-600 font-medium mb-4">Building the future of AI travel</p>
                  
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Shlok is a Computer Engineering student passionate about AI and travel technology. 
                      He founded Auriva to make travel planning effortless for everyone.
                    </p>
                    <p>
                      With expertise in React, AI integration, and product design, he's built this platform 
                      from the ground up — focusing on performance and user experience.
                    </p>
                    <p>
                      When he's not coding, Shlok explores new destinations, contributes to open source, 
                      and thinks about how to make travel more accessible through technology.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <a href="https://github.com/ThakkarShlok" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                      <Github className="w-4 h-4" />
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/shlok-thakkar-58a033354" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                    <a href="mailto:thakkar.shlok2120@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-lg">Four principles that guide every decision we make</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-700">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Explore the World?</h2>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers using Auriva to plan their perfect trips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/plan">
              <button className="px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                Plan Your Trip
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage