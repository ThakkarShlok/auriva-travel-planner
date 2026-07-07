import React, { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { X, Globe, Copy, Link, Share2, MessageCircle, Twitter, Send, Mail, Download } from 'lucide-react'
import { shareTrip, unshareTrip, downloadTripPDF } from '../../services/tripsService'
import { sendTripEmail } from '../../services/emailService'
import {
  isWebShareSupported,
  shareNative,
  whatsappShareUrl,
  twitterShareUrl,
  telegramShareUrl,
  emailShareUrl,
  copyToClipboard,
} from '../../utils/share'
import toast from 'react-hot-toast'
import Card from '../ui/Card'
import Button from '../ui/Button'

const SOCIAL_BUTTONS = [
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-600',
    getUrl: ({ url, text }) => whatsappShareUrl({ url, text }),
  },
  {
    label: 'Twitter',
    icon: Twitter,
    color: 'text-slate-700',
    getUrl: ({ url, text }) => twitterShareUrl({ url, text }),
  },
  {
    label: 'Telegram',
    icon: Send,
    color: 'text-sky-500',
    getUrl: ({ url, text }) => telegramShareUrl({ url, text }),
  },
  {
    label: 'Email',
    icon: Mail,
    color: 'text-slate-500',
    getUrl: ({ url, title, text }) => emailShareUrl({ url, title, text }),
  },
]

// Props:
//   isOpen, onClose, tripId, currentSlug, onShareChange — sharing plumbing
//   trip — full trip object ({ destination, duration, travelers, budget, overview, ... })
const ShareModal = ({ isOpen, onClose, tripId, currentSlug, onShareChange, trip }) => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [recipientNameInput, setRecipientNameInput] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  useEffect(() => {
    const primary = user?.primaryEmailAddress?.emailAddress
    if (primary) setEmailInput(primary)
  }, [user])

  if (!isOpen) return null

  const destination = trip?.destination
  const duration    = trip?.duration

  const shareUrl  = currentSlug ? `${window.location.origin}/share/${currentSlug}` : null
  const shareTitle = destination && duration
    ? `${duration} days in ${destination} — by Auriva`
    : 'Check out this trip on Auriva'
  const shareText = destination && duration
    ? `Check out this ${duration}-day ${destination} itinerary, crafted by Auriva`
    : 'Check out this travel itinerary on Auriva'

  const handleShare = async () => {
    setLoading(true)
    try {
      const result = await shareTrip(tripId, getToken)
      onShareChange(result.slug)
      toast.success('Share link generated!')
    } catch (err) {
      toast.error(err.message || 'Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const handleUnshare = async () => {
    setLoading(true)
    try {
      await unshareTrip(tripId, getToken)
      onShareChange(null)
      toast.success('Trip is now private.')
    } catch (err) {
      toast.error(err.message || 'Failed to stop sharing')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    const ok = await copyToClipboard(shareUrl)
    if (ok) toast.success('Link copied to clipboard!')
    else toast.error('Could not copy — please copy manually')
  }

  const handleNativeShare = async () => {
    await shareNative({ url: shareUrl, title: shareTitle, text: shareText })
  }

  const openSocial = (url) => window.open(url, '_blank', 'noopener,noreferrer')

  const handleEmailSend = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter an email address')
      return
    }
    if (!shareUrl) {
      toast.error('Generate a share link first')
      return
    }
    setIsSendingEmail(true)
    try {
      await sendTripEmail({
        recipientEmail: emailInput.trim(),
        recipientName: recipientNameInput.trim(),
        trip: {
          destination: trip?.destination,
          duration: trip?.duration,
          travelers: trip?.travelers,
          budget: trip?.budget,
          overview: trip?.overview,
        },
        shareUrl,
      })
      toast.success(`Trip sent to ${emailInput.trim()}!`)
      setRecipientNameInput('')
    } catch (err) {
      toast.error(err.message || 'Failed to send email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handlePDFDownload = async () => {
    setIsDownloadingPDF(true)
    try {
      await downloadTripPDF(tripId, getToken)
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <Card padding="lg" className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary-700" />
            <h2 className="text-lg font-semibold text-slate-800">Share this trip</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!currentSlug ? (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate a public link to share this itinerary with anyone. They won't need an account to view it.
            </p>
            <Button variant="primary" fullWidth loading={loading} onClick={handleShare}>
              Generate share link
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* URL display + copy */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Share URL</p>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-mono text-sm break-all text-slate-700 select-all">
                  {shareUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition flex items-center gap-1.5 text-slate-600 text-sm font-medium"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            {/* Share to section */}
            <div>
              <p className="text-sm text-slate-600 mb-3">Share to:</p>

              {isWebShareSupported() && (
                <Button
                  variant="primary"
                  fullWidth
                  icon={Share2}
                  onClick={handleNativeShare}
                  className="mb-3"
                >
                  Share via...
                </Button>
              )}

              <div className="grid grid-cols-4 gap-2">
                {SOCIAL_BUTTONS.map(({ label, icon: Icon, color, getUrl }) => (
                  <button
                    key={label}
                    onClick={() => openSocial(getUrl({ url: shareUrl, title: shareTitle, text: shareText }))}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                    aria-label={`Share on ${label}`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-xs text-slate-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email + PDF delivery */}
            <div className="border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Or send it directly:</p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Recipient's first name (optional)"
                  value={recipientNameInput}
                  onChange={(e) => setRecipientNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="recipient@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailSend()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Mail}
                    onClick={handleEmailSend}
                    loading={isSendingEmail}
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Leave the name blank and we'll guess from the email address.
                </p>

                <Button
                  variant="secondary"
                  fullWidth
                  icon={Download}
                  onClick={handlePDFDownload}
                  loading={isDownloadingPDF}
                  className="mt-1"
                >
                  Download as PDF
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 bg-primary-50 rounded-xl px-4 py-3">
              <Globe className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-800">
                Anyone with this link can view the itinerary. They don't need an Auriva account.
              </p>
            </div>

            {/* Unshare */}
            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                fullWidth
                loading={loading}
                onClick={handleUnshare}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                Stop sharing
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ShareModal
