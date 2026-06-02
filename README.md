# 🌍 Auriva - AI Travel Strategist

[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646cff?logo=vite)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/Groq-API-00A67E)](https://groq.com/)

> **Production-grade AI-powered travel planning application that generates personalized itineraries in seconds.**

## ✨ Live Demo

*(Add your deployed link here after deployment)*

## 🎯 Project Highlights for Recruiters

This project demonstrates:

- **Scalable Frontend Architecture** - Feature-based organization with Redux Toolkit
- **Production-Grade State Management** - RTK Query pattern for async operations
- **Professional UI/UX** - Custom Tailwind theme, responsive across all devices
- **Real AI Integration** - Groq API with rate limiting and error handling
- **Performance Optimized** - Lazy loading, code splitting, skeleton loaders
- **Complete Authentication Flow** - Login/Register with protected routes
- **Local Storage Persistence** - Saved trips persist across sessions

## 🚀 Features

### Core Functionality
- 🤖 **AI-Powered Itinerary Generation** - Personalized day-wise plans using Groq API
- 📝 **Smart Onboarding Flow** - Progressive disclosure of travel preferences
- 💰 **Dynamic Budget Planning** - Real-time budget breakdown and optimization
- 🗺️ **Destination Discovery** - 20+ destinations with search and filters
- 💬 **AI Chat Assistant** - 24/7 travel advice via Groq API
- 📱 **Responsive Design** - Mobile-first approach with seamless desktop experience

### User Experience
- 🔐 **Complete Authentication** - Login, Register, Forgot Password with session management
- 💾 **Trip Persistence** - Save and revisit itineraries
- 🎨 **Custom Design System** - Professional color theme
- ⚡ **Skeleton Loaders** - Smooth loading states

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, Vite |
| **State Management** | Redux Toolkit |
| **Styling** | Tailwind CSS |
| **Routing** | React Router DOM v6 |
| **HTTP Client** | Axios |
| **AI API** | Groq (Llama 3.1 8B) |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |

## 📁 Project Structure
auriva-travel-planner/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── cards/ # DestinationCard, TripCard
│ │ ├── layout/ # Navbar, Footer, Layout
│ │ ├── ui/ # Button, Input, Select, Textarea, Badge, Loader
│ │ └── ChatBot/ # AI chat assistant
│ ├── pages/ # Route-based pages
│ │ ├── auth/ # Login, Register, ForgotPassword
│ │ ├── Home/ # Landing page
│ │ ├── Onboarding/ # Trip preferences form
│ │ ├── Planner/ # Itinerary generation
│ │ ├── Dashboard/ # Saved trips
│ │ ├── Discover/ # Destination discovery
│ │ ├── About/ # Company info
│ │ └── Contact/ # Contact form
│ ├── store/ # Redux slices (auth, trip, ui)
│ ├── services/ # API layer, Groq service, localStorage
│ ├── hooks/ # Custom hooks (useDebounce, usePageTitle)
│ ├── constants/ # Destinations database, routes
│ └── assets/ # Images, global styles
├── public/
└── package.json


Environment Variables
Create a .env file in the root directory:

env
VITE_GROQ_API_URL=https://api.groq.com/openai/v1
VITE_GROQ_API_KEY=your_groq_api_key_here
🎨 Color Theme
Color	Usage
Navy Blue	Primary brand, buttons, headers
Warm Sand	Secondary accents
Terracotta	Hover states
White/Gray	Backgrounds, cards
📱 Responsive Breakpoints
Mobile: 375px - 640px

Tablet: 768px - 1024px

Desktop: 1280px - 1536px

🔒 Security Notes
API keys stored in environment variables only

.env is excluded from version control via .gitignore

For production, route API calls through a backend proxy

📧 Contact
Shlok Thakkar

GitHub: @ThakkarShlok

LinkedIn: Shlok Thakkar

Email: thakkarshlok2007@gmail.com
