// src/store/slices/tripSlice.js - FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { generateItinerary as serviceGenerateItinerary } from '../../services/grokService'

let generationInProgress = false

export const generateItinerary = createAsyncThunk(
  'trip/generate',
  async (preferences, { rejectWithValue }) => {
    if (generationInProgress) {
      return rejectWithValue('Generation already in progress')
    }
    try {
      generationInProgress = true
      const result = await serviceGenerateItinerary(preferences)
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    } finally {
      generationInProgress = false
    }
  }
)

const initialState = {
  currentTrip: null,
  savedTrips: JSON.parse(localStorage.getItem('voyage_trips') || '[]'),
  loading: false,
  error: null,
  onboardingData: {
    destination: '',
    duration: 3,
    budget: 'moderate',
    travelers: 2,
    interests: ''
  }
}

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    updateOnboarding: (state, action) => {
      state.onboardingData = { ...state.onboardingData, ...action.payload }
    },
    saveTrip: (state, action) => {
      const newTrip = { ...action.payload, id: Date.now(), savedAt: new Date().toISOString() }
      state.savedTrips = [newTrip, ...state.savedTrips]
      localStorage.setItem('voyage_trips', JSON.stringify(state.savedTrips))
    },
    deleteTrip: (state, action) => {
      state.savedTrips = state.savedTrips.filter(t => t.id !== action.payload)
      localStorage.setItem('voyage_trips', JSON.stringify(state.savedTrips))
    },
    // Save the current generated trip into `currentTrip`
    saveCurrentTrip: (state, action) => {
      state.currentTrip = action.payload
    },
    // Clear the currently generated trip
    clearCurrentTrip: (state) => {
      state.currentTrip = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateItinerary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateItinerary.fulfilled, (state, action) => {
        state.loading = false
        state.currentTrip = action.payload
      })
      .addCase(generateItinerary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { updateOnboarding, saveTrip, deleteTrip, clearError, saveCurrentTrip, clearCurrentTrip } = tripSlice.actions
export default tripSlice.reducer