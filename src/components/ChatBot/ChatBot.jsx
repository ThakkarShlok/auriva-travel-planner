import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader, Minimize2, Maximize2, Sparkles } from 'lucide-react'
import { chatWithAI } from '../../services/grokService'
import toast from 'react-hot-toast'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Auriva, your AI travel assistant. Ask me anything about your trip! ✈️' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const conversationHistory = messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
      const response = await chatWithAI(input, conversationHistory)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      toast.error('Failed to get response. Please try again.')
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble right now. Please try again in a moment.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all z-50 group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-14' : 'w-96 h-[550px]'}`}>
      <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Auriva AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }} className="hover:bg-white/20 p-1 rounded transition">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false) }} className="hover:bg-white/20 p-1 rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="h-[430px] overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <Loader className="w-4 h-4 animate-spin text-primary-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about destinations, flights, hotels..."
                className="flex-1 border border-gray-200 rounded-xl p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Powered by Groq AI • 24/7 Travel Assistant</p>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatBot