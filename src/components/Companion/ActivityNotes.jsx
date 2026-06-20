import React, { useState, useEffect, useRef } from 'react'
import { StickyNote, ChevronDown, ChevronUp } from 'lucide-react'
import useDebounce from '../../hooks/useDebounce'

const ActivityNotes = ({ notes: initialNotes, onSave }) => {
  const [open, setOpen] = useState(!!initialNotes)
  const [value, setValue] = useState(initialNotes || '')
  const [status, setStatus] = useState('idle') // idle | dirty | saving | saved | offline
  const debouncedValue = useDebounce(value, 800)
  const isFirstRender = useRef(true)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (debouncedValue === (initialNotes || '')) return

    setStatus('saving')
    Promise.resolve(onSave?.(debouncedValue || null))
      .then(() => {
        const isOffline = typeof window !== 'undefined' && !window.navigator.onLine
        setStatus(isOffline ? 'offline' : 'saved')
        setTimeout(() => setStatus('idle'), 2000)
      })
      .catch(() => setStatus('idle'))
  }, [debouncedValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    setOpen(o => {
      const next = !o
      if (next) setTimeout(() => textareaRef.current?.focus(), 50)
      return next
    })
  }

  const hasNotes = !!value.trim()

  return (
    <div className="mt-3">
      {/* Trigger — visible button, not a ghost link */}
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
          ${hasNotes
            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
          }`}
      >
        <StickyNote className="w-3.5 h-3.5 flex-shrink-0" />
        {open
          ? 'Hide notes'
          : hasNotes
            ? `Notes · ${value.trim().slice(0, 28)}${value.trim().length > 28 ? '…' : ''}`
            : 'Add personal notes'
        }
        {open ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
      </button>

      {open && (
        <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); setStatus('dirty') }}
            placeholder="Add your personal notes, tips, or reminders for this activity..."
            rows={3}
            className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-slate-700 placeholder:text-slate-400 bg-white"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-amber-600 font-medium">
              {status === 'dirty' && 'Saving in a moment…'}
              {status === 'saving' && 'Saving…'}
              {status === 'saved' && '✓ Saved'}
              {status === 'offline' && '⏳ Saved offline — will sync on reconnect'}
            </p>
            <p className="text-[10px] text-slate-400">{value.length} chars</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityNotes
