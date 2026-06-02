// src/store/itinerarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadItineraryState, saveItineraryState } from '../services/localStorageService.js'
import { generateItinerary } from '../services/grokService.js'

const initialState = loadItineraryState() || {
  onboarding: {
    destination: '',
    travelType: 'Solo',
    dates: '',
    duration: 5,
    budget: 'Moderate',
    travelers: '1',
    accommodation: 'Boutique hotel',
    transportation: 'Flight',
    food: 'Local cuisine',
    interests: 'Cultural experiences',
    pace: 'Balanced'
  },
  plan: null,
  savedTrips: [],
  status: 'idle',
  error: null
}

export const createSmartItinerary = createAsyncThunk(
  'itinerary/createSmartItinerary',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await generateItinerary(preferences)
      if (!response) {
        throw new Error('No response from AI service')
      }
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to generate itinerary')
    }
  }
)

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    updateOnboarding(state, action) {
      state.onboarding = { ...state.onboarding, ...action.payload }
      saveItineraryState(state)
    },
    saveTrip(state, action) {
      const newTrip = {
        ...action.payload,
        id: action.payload.id || `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      state.savedTrips = [newTrip, ...state.savedTrips]
      saveItineraryState(state)
    },
    duplicateTrip(state, action) {
      const trip = state.savedTrips.find((item) => item.id === action.payload)
      if (trip) {
        const clone = { 
          ...trip, 
          id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          title: `${trip.title} (copy)` 
        }
        state.savedTrips = [clone, ...state.savedTrips]
        saveItineraryState(state)
      }
    },
    clearPlan(state) {
      state.plan = null
      state.status = 'idle'
      state.error = null
      saveItineraryState(state)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(createSmartItinerary.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createSmartItinerary.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.plan = action.payload
        state.error = null
        saveItineraryState(state)
      })
      .addCase(createSmartItinerary.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to generate itinerary'
      })
  }
})

export const { updateOnboarding, saveTrip, duplicateTrip, clearPlan } = itinerarySlice.actions
export default itinerarySlice.reducer