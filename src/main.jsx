import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { flush } from './utils/mutationQueue'
import App from './App'
import OfflineBanner from './components/Companion/OfflineBanner'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set. Add it to .env.local.')
}

// Service worker — production only; dev uses Vite's HMR, not SW
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] registration failed:', err.message)
    })
  })
}

// MutationQueueFlusher: flushes queued offline mutations when the user comes back online.
// Lives inside ClerkProvider so useAuth() is available.
function MutationQueueFlusher() {
  const { getToken } = useAuth()
  React.useEffect(() => {
    const onOnline = () => {
      flush(async (mutation) => {
        const token = await getToken()
        if (!token) return
        const res = await fetch(mutation.endpoint, {
          method: mutation.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mutation.body),
        })
        if (!res.ok) throw new Error(`Replay failed: ${res.status}`)
      })
    }
    window.addEventListener('online', onOnline)
    // Also flush on mount in case mutations were queued in a previous session
    if (navigator.onLine) onOnline()
    return () => window.removeEventListener('online', onOnline)
  }, [getToken])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <Provider store={store}>
        <CurrencyProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <MutationQueueFlusher />
            <OfflineBanner />
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                },
              }}
            />
          </BrowserRouter>
        </CurrencyProvider>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
)
