// Contact info — single source of truth across the app.
// Update this file when contact details change; everywhere else imports from here.

export const CONTACT = {
  supportEmail: 'support.auriva@gmail.com',
  phone: '+918128698935',
  phoneDisplay: '+91 81286 98935',
  whatsappNumber: '918128698935', // no plus, no spaces — for wa.me URLs
}

export const mailto = (subject = '', body = '') => {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return `mailto:${CONTACT.supportEmail}${qs ? '?' + qs : ''}`
}

export const telLink = () => `tel:${CONTACT.phone}`

export const whatsappLink = (message = '') => {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
