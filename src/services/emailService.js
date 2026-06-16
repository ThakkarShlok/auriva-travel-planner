import emailjs from '@emailjs/browser'
import { CONTACT } from '../constants/contact.js'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const TEMPLATE_TRIP    = import.meta.env.VITE_EMAILJS_TEMPLATE_TRIP
const TEMPLATE_CONTACT = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT

// Derive a friendly first name from an email address when none is provided.
// "param.patel@gmail.com" -> "Param", "shlok2120@gmail.com" -> "Shlok", "" -> "there"
function nameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'there'
  const local = email.split('@')[0] || ''
  const first = local.split(/[._\-0-9]/)[0] || local
  if (!first) return 'there'
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

let initialized = false
function ensureInit() {
  if (!initialized) {
    if (!PUBLIC_KEY) {
      throw new Error('EmailJS not configured. Add VITE_EMAILJS_PUBLIC_KEY to .env.local.')
    }
    emailjs.init({ publicKey: PUBLIC_KEY })
    initialized = true
  }
}

/**
 * Send a trip itinerary to a recipient.
 * The email contains the share URL — recipients view the trip in-browser
 * and download the PDF separately via the page. No PDF attachment.
 */
export async function sendTripEmail({ recipientEmail, recipientName, trip, shareUrl }) {
  ensureInit()

  if (!SERVICE_ID || !TEMPLATE_TRIP) {
    throw new Error(
      'EmailJS trip template not configured. Set VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_TEMPLATE_TRIP.'
    )
  }
  if (!shareUrl) {
    throw new Error('Trip must be shared (have a public link) before emailing.')
  }

  const displayName = (recipientName && recipientName.trim()) || nameFromEmail(recipientEmail)

  const params = {
    to_email:         recipientEmail,
    to_name:          displayName,
    trip_destination: trip.destination,
    trip_duration:    String(trip.duration),
    trip_travelers:   String(trip.travelers),
    trip_budget:      trip.budget,
    trip_overview:    trip.overview || '',
    share_url:        shareUrl,
    reply_to:         CONTACT.supportEmail,
  }

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_TRIP, params)
    if (response.status !== 200) {
      throw new Error(`EmailJS returned status ${response.status}`)
    }
    return { ok: true }
  } catch (error) {
    throw new Error(error?.text || error?.message || 'Failed to send email')
  }
}

/**
 * Submit the contact form.
 * Email is delivered to support.auriva@gmail.com with reply_to set to the
 * user's email — replying in Gmail goes directly to them.
 */
export async function submitContactForm({ name, email, subject, message }) {
  ensureInit()

  if (!SERVICE_ID || !TEMPLATE_CONTACT) {
    throw new Error(
      'EmailJS contact template not configured. Set VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_TEMPLATE_CONTACT.'
    )
  }

  if (!name?.trim())  throw new Error('Name is required')
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email is required')
  }
  if (!subject?.trim()) throw new Error('Subject is required')
  if (!message?.trim()) throw new Error('Message is required')
  if (message.length > 5000) throw new Error('Message too long (max 5000 chars)')

  const params = {
    from_name:  name.trim(),
    from_email: email.trim(),
    subject:    subject.trim(),
    message:    message.trim(),
    to_email:   CONTACT.supportEmail,
    reply_to:   email.trim(),
  }

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_CONTACT, params)
    if (response.status !== 200) {
      throw new Error(`EmailJS returned status ${response.status}`)
    }
    return { ok: true }
  } catch (error) {
    throw new Error(error?.text || error?.message || 'Failed to send message')
  }
}
