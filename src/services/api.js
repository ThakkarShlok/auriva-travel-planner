// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_GROQ_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
  },
  timeout: 30000
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error?.message || 
                     error.response.data?.message || 
                     `API Error: ${error.response.status}`
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network error - please check your connection'))
    } else {
      // Something else
      return Promise.reject(new Error(error.message || 'Request failed'))
    }
  }
)

export default api