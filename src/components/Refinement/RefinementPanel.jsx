import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Sparkles, Send, X } from 'lucide-react'
import { refineTrip, getConversation } from '../../services/tripsService'
import Card from '../ui/Card'

const QUICK_ACTIONS = [
  'Less hectic days',
  'More budget-friendly',
  'More cultural sites',
  'More outdoor activities',
]

const MessageLog = ({ messages, refining, endRef }) => (
  <div className="flex-1 overflow-y-auto space-y-2 max-h-44 pr-1 min-h-[3rem]">
    {messages.length === 0 ? (
      <p className="text-xs text-slate-400 text-center py-3">
        Ask me to change anything about your trip.
      </p>
    ) : (
      messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[88%] px-3 py-2 rounded-xl text-sm leading-snug ${
            msg.role === 'user'
              ? 'bg-primary-50 text-primary-900'
              : 'bg-slate-50 text-slate-700'
          }`}>
            {msg.content}
          </div>
        </div>
      ))
    )}
    {refining && (
      <div className="flex justify-start">
        <div className="bg-slate-50 px-3 py-2 rounded-xl flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    )}
    <div ref={endRef} />
  </div>
)

const InputArea = ({ input, setInput, refining, refinementError, onQuickAction, onSubmit, onKeyDown }) => (
  <div>
    <div className="flex flex-wrap gap-1.5 mb-2">
      {QUICK_ACTIONS.map(action => (
        <button
          key={action}
          type="button"
          onClick={() => onQuickAction(action)}
          disabled={refining}
          className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-primary-600 hover:text-primary-700 transition disabled:opacity-40"
        >
          {action}
        </button>
      ))}
    </div>
    <form onSubmit={onSubmit} className="flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder='Try: "Make day 2 less hectic"'
        rows={2}
        disabled={refining}
        className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 resize-none focus:ring-2 focus:ring-primary-700 focus:border-transparent outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || refining}
        className="self-end p-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
    {refinementError && (
      <p className="text-xs text-red-600 mt-2">{refinementError}</p>
    )}
  </div>
)

/**
 * Props:
 *   tripId   — Neon trip UUID (required)
 *   onRefined(updatedItinerary) — called after a successful refinement so the
 *                                  parent page can update its local trip state
 */
const RefinementPanel = ({ tripId, onRefined }) => {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [refinementError, setRefinementError] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const desktopEndRef = useRef(null)
  const sheetEndRef = useRef(null)

  // Load conversation history on mount
  useEffect(() => {
    if (!tripId) return
    getConversation(tripId, getToken)
      .then(setMessages)
      .catch(() => {}) // Non-critical — empty history shown if load fails
  }, [tripId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    desktopEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    sheetEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, refining])

  const submit = async (instruction) => {
    const text = (instruction ?? input).trim()
    if (!text || refining) return

    setInput('')
    setRefinementError(null)
    setRefining(true)

    // Optimistic user message
    setMessages(prev => [...prev, { role: 'user', content: text }])

    try {
      const updated = await refineTrip({ tripId, instruction: text }, getToken)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Done! Updated your itinerary based on: "${text.slice(0, 60)}"` },
      ])
      onRefined?.(updated)
    } catch (err) {
      const msg = err.message || 'Refinement failed'
      setRefinementError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: `Something went wrong: ${msg}` }])
    } finally {
      setRefining(false)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    submit(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  return (
    <>
      {/* Desktop: card in sidebar */}
      <div className="hidden lg:block">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary-700" />
            <h3 className="text-sm font-semibold text-slate-800">Refine your itinerary</h3>
          </div>
          <div className="flex flex-col gap-3">
            <MessageLog messages={messages} refining={refining} endRef={desktopEndRef} />
            <InputArea
              input={input}
              setInput={setInput}
              refining={refining}
              refinementError={refinementError}
              onQuickAction={submit}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </Card>
      </div>

      {/* Mobile: floating trigger + bottom sheet */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsSheetOpen(true)}
          className="fixed bottom-24 right-6 bg-accent-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold hover:bg-accent-600 transition z-40"
        >
          <Sparkles className="w-4 h-4" />
          Refine trip
        </button>

        {isSheetOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsSheetOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 shadow-lg flex flex-col max-h-[72vh]">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-700" />
                  <h3 className="text-base font-semibold text-slate-800">Refine your itinerary</h3>
                </div>
                <button onClick={() => setIsSheetOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 p-6 overflow-y-auto flex-1">
                <MessageLog messages={messages} refining={refining} endRef={sheetEndRef} />
                <InputArea
                  input={input}
                  setInput={setInput}
                  refining={refining}
                  refinementError={refinementError}
                  onQuickAction={submit}
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default RefinementPanel
