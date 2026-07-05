import { requireUser, AuthError } from './_lib/auth.js'
import { getTripWithDays, getPublicTripBySlug } from '../../db/queries/trips.js'
import { renderToBuffer } from '@react-pdf/renderer'
import { TripPDFDocument } from '../../pdf/TripPDFDocument.js'
import React from 'react'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tripId, slug } = req.query

  try {
    let trip

    if (slug) {
      // Public access via share slug — no auth required
      trip = await getPublicTripBySlug(slug)
      if (!trip) return res.status(404).json({ error: 'Trip not found or no longer shared' })
    } else if (tripId) {
      // Authenticated access
      const user = await requireUser(req)
      trip = await getTripWithDays(tripId, user.id)
      if (!trip) return res.status(404).json({ error: 'Trip not found' })
    } else {
      return res.status(400).json({ error: 'Either tripId or slug is required' })
    }

    const pdfBuffer = await renderToBuffer(React.createElement(TripPDFDocument, { trip }))

    const safeName = trip.destination
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `auriva-${safeName}.pdf`

    res.status(200)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.end(pdfBuffer)

  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('[api download-pdf]', error.message)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export const config = { maxDuration: 30 }
