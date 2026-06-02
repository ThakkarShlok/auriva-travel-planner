import axios from 'axios'

const API_URL = import.meta.env.VITE_GROQ_API_URL
const API_KEY = import.meta.env.VITE_GROQ_API_KEY

let requestCount = 0
let lastResetTime = Date.now()

const checkRateLimit = () => {
  const now = Date.now()
  if (now - lastResetTime > 60000) {
    requestCount = 0
    lastResetTime = now
  }
  
  if (requestCount >= 10) {
    throw new Error('Rate limit reached. Please wait a moment.')
  }
  requestCount++
}

export const generateItinerary = async (preferences) => {
  try {
    checkRateLimit()
    
    const prompt = `Create a concise travel itinerary for ${preferences.destination}, ${preferences.duration} days. 
    Budget: ${preferences.budget}. Travelers: ${preferences.travelers}. 
    Interests: ${preferences.interests || 'sightseeing, local food, culture'}.
    
    Return a JSON object with this structure:
    {
      "overview": "Brief trip summary",
      "days": [
        {
          "title": "Day 1 Title",
          "activities": [
            {"time": "09:00", "title": "Activity", "description": "Details", "cost": 0}
          ]
        }
      ],
      "budget": {"accommodation": 0, "food": 0, "activities": 0, "transport": 0},
      "hotels": ["Hotel 1", "Hotel 2"],
      "packing": ["Item 1", "Item 2"],
      "tips": ["Tip 1", "Tip 2"]
    }`

    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a travel planner. Return ONLY valid JSON, no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    const content = response.data.choices[0].message.content
    // Parse JSON response
    try {
      return JSON.parse(content)
    } catch {
      // If not valid JSON, return structured fallback
      return {
        overview: `A ${preferences.duration}-day adventure in ${preferences.destination}`,
        days: [
          {
            title: "Day 1: Arrival & Exploration",
            activities: [
              { time: "10:00", title: "Arrival", description: "Check into your accommodation", cost: 0 },
              { time: "14:00", title: "City Tour", description: "Explore the main attractions", cost: 50 },
              { time: "19:00", title: "Dinner", description: "Local cuisine experience", cost: 30 }
            ]
          }
        ],
        budget: { accommodation: 200, food: 150, activities: 100, transport: 50 },
        hotels: ["Central Grand Hotel", "Boutique Stay Inn"],
        packing: ["Passport", "Comfortable shoes", "Camera", "Weather-appropriate clothes"],
        tips: ["Book attractions in advance", "Learn basic local phrases"]
      }
    }
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error?.message || 'Failed to generate itinerary')
  }
}

export const chatWithAI = async (message, conversationHistory = []) => {
  try {
    checkRateLimit()
    
    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant. Give concise, practical travel advice.'
          },
          ...conversationHistory,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return response.data.choices[0].message.content
  } catch (error) {
    console.error('Chat Error:', error.response?.data || error.message)
    throw new Error('Failed to get response. Please try again.')
  }
}