import React, { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { Activity, AlertCircle, Clock, Zap } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import usePageTitle from '../../hooks/usePageTitle'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean)

const AdminMetricsPage = () => {
  usePageTitle('Admin Metrics')
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userEmail = user?.primaryEmailAddress?.emailAddress
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)

  useEffect(() => {
    if (!isLoaded || !isAdmin) return
    let cancelled = false
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isLoaded, isAdmin, getToken])

  if (!isLoaded) return <Loader fullScreen />
  if (!isAdmin) return <Navigate to="/" replace />
  if (loading) return <Loader fullScreen />
  if (error) {
    return (
      <div className="container-custom py-12">
        <Card padding="lg">
          <p className="text-red-600">Failed to load metrics: {error}</p>
        </Card>
      </div>
    )
  }

  const { summary, dailyVolume, endpointBreakdown, recent } = data

  return (
    <>
      <PageHeader
        eyebrow="ADMIN"
        title="Generation metrics"
        description="Last 7 days · operational data for AI generation calls"
      />
      <div className="container-custom py-8 space-y-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <Activity className="w-5 h-5 text-primary-700" />
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</div>
            <div className="text-xs text-slate-500 mt-1">Generations</div>
          </Card>
          <Card padding="md">
            <div className="flex items-start justify-between">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-xs text-slate-500">Success</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{summary.successes}</div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.total > 0 ? Math.round(summary.successes / summary.total * 100) : 0}% rate
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-start justify-between">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-slate-500">Latency</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {summary.avgLatencyMs ? `${(summary.avgLatencyMs / 1000).toFixed(1)}s` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Average</div>
          </Card>
          <Card padding="md">
            <div className="flex items-start justify-between">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-slate-500">Errors</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{summary.errors}</div>
            <div className="text-xs text-slate-500 mt-1">In window</div>
          </Card>
        </div>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily volume (14 days)</h3>
          {dailyVolume.length === 0 ? (
            <p className="text-slate-500 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {dailyVolume.map(row => {
                const max = Math.max(...dailyVolume.map(r => r.count))
                const width = max > 0 ? (row.count / max * 100) : 0
                return (
                  <div key={row.day} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-slate-500">{row.day}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                      <div
                        className="bg-primary-600 h-6 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                      <span className="absolute left-3 top-0 leading-6 text-xs font-medium text-white">
                        {row.count}
                      </span>
                    </div>
                    <div className="w-16 text-xs text-slate-500 text-right">
                      {row.avgLatency ? `${(row.avgLatency / 1000).toFixed(1)}s` : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">By endpoint</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
                <th className="py-2">Endpoint</th>
                <th className="py-2">Calls</th>
                <th className="py-2">Avg latency</th>
                <th className="py-2">Error rate</th>
              </tr>
            </thead>
            <tbody>
              {endpointBreakdown.map(row => (
                <tr key={row.endpoint} className="border-b border-slate-100">
                  <td className="py-3 text-slate-900 font-mono">{row.endpoint}</td>
                  <td className="py-3 text-slate-700">{row.count}</td>
                  <td className="py-3 text-slate-700">
                    {row.avgLatency ? `${(row.avgLatency / 1000).toFixed(1)}s` : '—'}
                  </td>
                  <td className={`py-3 ${parseFloat(row.errorRate) > 5 ? 'text-red-600' : 'text-slate-700'}`}>
                    {row.errorRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent generations</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recent.map(row => (
              <div key={row.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  row.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="font-mono text-slate-900">{row.endpoint}</span>
                    <span className="text-slate-500">{new Date(row.createdAt).toLocaleString()}</span>
                  </div>
                  {row.errorMessage && (
                    <div className="text-red-600 mt-1 truncate">{row.errorMessage}</div>
                  )}
                  <div className="text-slate-500 mt-1">
                    {row.latencyMs ? `${row.latencyMs}ms` : '—'}
                    {row.totalTokens ? ` · ${row.totalTokens} tokens` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  )
}

export default AdminMetricsPage
