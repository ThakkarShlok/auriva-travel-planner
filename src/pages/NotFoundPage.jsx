import { Link } from 'react-router-dom'
import TopNav from '../components/layout/TopNav.jsx'
import Footer from '../components/layout/Footer.jsx'
import Button from '../components/ui/Button.jsx'
import usePageTitle from '../hooks/usePageTitle.js'

function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <div className="min-h-screen bg-surf text-ink-900">
      <TopNav />
      <main className="mx-auto flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-16 lg:px-8">
        <div className="max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-12 shadow-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Page not found</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink-900">We couldn't find that page.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The page may have moved or the link is broken. Return to the landing page to continue planning your trip.
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button type="button">Back to home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default NotFoundPage
