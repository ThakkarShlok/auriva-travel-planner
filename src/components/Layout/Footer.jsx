import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Github, Linkedin, Mail, Compass, Calendar, LayoutDashboard, Globe, Info, MessageCircle } from 'lucide-react';
import { CONTACT, mailto, whatsappLink } from '../../constants/contact';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home', icon: Compass },
    { path: '/plan', label: 'Plan Trip', icon: Calendar },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover', icon: Globe },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: MessageCircle },
  ];

  const features = [
    'AI-Powered Itineraries',
    'Smart Budget Planning',
    'Local Expert Recommendations',
    'Packing Checklists',
    '24/7 AI Support',
    'Trip Sharing',
  ];

  const socialLinks = [
    { icon: Github,         href: 'https://github.com/ThakkarShlok',                            label: 'GitHub',    bg: 'hover:bg-gray-700' },
    { icon: Linkedin,       href: 'https://www.linkedin.com/in/shlok-thakkar-58a033354',        label: 'LinkedIn',  bg: 'hover:bg-blue-700' },
    { icon: Mail,           href: mailto(),                                                       label: 'Email',     bg: 'hover:bg-red-700' },
    { icon: MessageCircle,  href: whatsappLink(),                                                 label: 'WhatsApp',  bg: 'hover:bg-green-700' },
  ];

  return (
    <footer className="bg-gray-800 text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight">Auriva</span>
                <p className="text-xs text-gray-400 tracking-wider">AI TRAVEL STRATEGIST</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              Your intelligent travel companion powered by advanced AI.
              Create personalized itineraries in seconds and explore the world with confidence.
            </p>
            <p className="text-gray-500 text-xs mt-4">© {currentYear} Auriva. All rights reserved.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-300 transition flex items-center gap-2 text-sm">
                    <link.icon className="w-3 h-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="text-gray-400 text-sm flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent-500 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center ${social.bg} transition-all duration-300 hover:scale-110`}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Built with <Heart className="w-3 h-3 text-red-400 inline fill-red-400" /> by Shlok Thakkar
            </p>
            <p className="text-gray-500 text-xs mt-2">Engineering the future of travel</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
