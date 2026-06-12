import axios from 'axios'

function extractError(error) {
  const serverMsg = error?.response?.data?.error
  const serverCode = error?.response?.data?.code
  if (serverMsg) {
    if (serverCode?.startsWith('Env')) return `Server configuration error: ${serverMsg}`
    return serverMsg
  }
  if (error?.message) return error.message
  return 'Unknown error contacting the AI service'
}

export const generateItinerary = async (preferences, { signal } = {}) => {
  try {
    const response = await axios.post('/api/generate-itinerary', {
      destination: preferences.destination,
      duration: Number(preferences.duration),
      budget: preferences.budget,
      travelers: Number(preferences.travelers),
      interests: preferences.interests,
    }, { signal })
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) throw error
    throw new Error(extractError(error))
  }
}

export const chatWithAI = async (message, history = [], { signal } = {}) => {
  try {
    const response = await axios.post('/api/chat', { message, history }, { signal })
    return response.data.message
  } catch (error) {
    if (axios.isCancel(error)) throw error
    throw new Error(extractError(error))
  }
}
