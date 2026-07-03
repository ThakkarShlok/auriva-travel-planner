import React, { useState } from 'react'
import { Mail, Phone, Clock, MessageCircle, Send, CheckCircle, Github, Linkedin, Sparkles, Star, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { submitContactForm } from '../../services/emailService'
import { CONTACT, mailto, telLink, whatsappLink } from '../../constants/contact'
import usePageTitle from '../../hooks/usePageTitle'

const ContactPage = () => {
  usePageTitle('Contact')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitContactForm(formData)
      setIsSubmitted(true)
      toast.success("Message sent! We'll get back to you within 24 hours.")
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (err) {
      toast.error(err.message || 'Failed to send. Please email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: CONTACT.supportEmail,
      action: mailto('Question about Auriva'),
    },
    {
      icon: Phone,
      title: 'Phone',
      details: CONTACT.phoneDisplay,
      action: telLink(),
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: 'Chat with us',
      action: whatsappLink('Hi Auriva team, I have a question about...'),
    },
    {
      icon: Clock,
      title: 'Response Time',
      details: 'Within 24 hours',
      action: '#',
    },
  ]

  const faqs = [
    { question: 'How does Auriva generate itineraries?', answer: 'Auriva uses advanced AI (Groq API) to analyze your preferences, budget, and travel style to create personalized day-by-day itineraries.' },
    { question: 'Is Auriva free to use?', answer: "Yes! Auriva is completely free to use. We're committed to providing value before introducing any premium features." },
    { question: 'Can I save and edit my itineraries?', answer: 'Absolutely! You can save, edit, duplicate, and delete your itineraries from your dashboard.' },
    { question: 'Do you offer customer support?', answer: 'Yes! We provide 24/7 AI-powered chat support and email support within 24 hours.' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <MessageCircle className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Let's Talk Travel</h1>
          <p className="text-gray-600 text-lg">Have questions about planning your next adventure? We're here to help!</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, idx) => (
            <a
              key={idx}
              href={info.action}
              target={info.action.startsWith('http') ? '_blank' : undefined}
              rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="bg-white p-6 rounded-2xl shadow-card text-center hover:shadow-hover transition-all group"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <info.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">{info.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{info.details}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Send us a Message</h2>
            </div>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-600">Message sent! We'll get back to you within 24 hours.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="Tell us about your query or feedback..."
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right panel */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="group cursor-pointer">
                    <summary className="font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-xl group-hover:bg-primary-50 transition">
                      {faq.question}
                    </summary>
                    <p className="text-gray-600 text-sm mt-2 px-4 pb-3">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            {/* 24/7 AI Support */}
            <div className="bg-primary-700 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <MessageCircle className="w-12 h-12" />
                <Sparkles className="w-8 h-8 text-primary-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">24/7 AI Support</h3>
              <p className="text-primary-200 mb-6">Get instant answers from Auriva AI — available round the clock</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-primary-200">AI Assistant Online</span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-primary-200">✨ Try asking: "What's the best time to visit Bali?"</p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('auriva:open-chat'))}
                className="w-full bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Chat Now
              </button>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-primary-200 text-sm">Average response time: &lt; 30 seconds</p>
              </div>
            </div>

            {/* Quick Connect — WhatsApp */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Connect</h3>
              <p className="text-sm text-gray-600 mb-5">Get a faster response on WhatsApp.</p>
              <a
                href={whatsappLink('Hi Auriva team, I have a question.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Connect With Me</h4>
                <div className="flex justify-center gap-4">
                  <a href="https://github.com/ThakkarShlok" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 hover:scale-110 transition-all">
                    <Github className="w-5 h-5 text-white" />
                  </a>
                  <a href="https://www.linkedin.com/in/shlok-thakkar-58a033354" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all">
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a href={mailto()} className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all">
                    <Mail className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
