import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { generateItinerary as serviceGenerateItinerary } from '../../services/grokService'
import { streamItinerary, refineItinerary } from '../../services/streamingService'
import { storage } from '../../services/localStorageService'

const loadOnboardingData = () =>
  storage.get(storage.keys.ONBOARDING) || {
    destination: '',
    duration: 3,
    budget: 'moderate',
    travelers: 2,
    interests: '',
  }

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const generateItinerary = createAsyncThunk(
  'trip/generate',
  async (preferences, { rejectWithValue, signal }) => {
    try {
      return await serviceGenerateItinerary(preferences, { signal })
    } catch (error) {
      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') throw error
      return rejectWithValue(error.message)
    }
  }
)

export const generateItineraryStreaming = createAsyncThunk(
  'trip/generateStreaming',
  async (preferences, { dispatch, signal, rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      dispatch(tripSlice.actions.streamStarted())

      streamItinerary(preferences, {
        signal,
        onPartialJson: (partial) => {
          dispatch(tripSlice.actions.streamProgress(partial))
        },
        onToken: (_, accumulated) => {
          dispatch(tripSlice.actions.streamTokenCount(accumulated.length))
        },
        onDone: (final) => {
          dispatch(tripSlice.actions.streamCompleted(final))
          resolve(final)
        },
        onError: (msg) => {
          // State is managed externally:
          // - clean abort → PlannerPage cleanup dispatches streamAborted synchronously
          // - real error  → generateItineraryStreaming.rejected extraReducer sets error
          reject(new Error(msg))
        },
      })
    }).catch((err) => rejectWithValue(err.message))
  }
)

export const refineCurrentItinerary = createAsyncThunk(
  'trip/refine',
  async (instruction, { getState, rejectWithValue }) => {
    const state = getState().trip
    if (!state.currentTrip) return rejectWithValue('No current itinerary to refine')
    try {
      const updated = await refineItinerary(
        state.currentTrip,
        instruction,
        {
          destination: state.onboardingData.destination,
          duration: state.onboardingData.duration,
        }
      )
      return { updated, instruction }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const loadUserTrips = createAsyncThunk(
  'trip/loadUserTrips',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id
    if (!userId) return []
    return storage.get(storage.getTripsKey(userId)) || []
  }
)

export const saveTrip = createAsyncThunk(
  'trip/save',
  async (tripData, { getState }) => {
    const userId = getState().auth.user?.id
    const newTrip = {
      ...tripData,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    }
    const key = storage.getTripsKey(userId)
    const existing = storage.get(key) || []
    const updated = [newTrip, ...existing]
    storage.set(key, updated)
    return updated
  }
)

export const deleteTrip = createAsyncThunk(
  'trip/delete',
  async (tripId, { getState }) => {
    const userId = getState().auth.user?.id
    const key = storage.getTripsKey(userId)
    const existing = storage.get(key) || []
    const updated = existing.filter((t) => t.id !== tripId)
    storage.set(key, updated)
    return updated
  }
)

export const duplicateTrip = createAsyncThunk(
  'trip/duplicate',
  async (tripId, { getState }) => {
    const userId = getState().auth.user?.id
    const { savedTrips } = getState().trip
    const trip = savedTrips.find((t) => t.id === tripId)
    if (!trip) throw new Error('Trip not found')
    const newTrip = {
      ...trip,
      id: crypto.randomUUID(),
      destination: `${trip.destination} (copy)`,
      savedAt: new Date().toISOString(),
    }
    const key = storage.getTripsKey(userId)
    const existing = storage.get(key) || []
    const updated = [newTrip, ...existing]
    storage.set(key, updated)
    return updated
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  currentTrip: null,
  savedTrips: [],
  loading: false,
  error: null,
  currentRequestId: null,
  onboardingData: loadOnboardingData(),
  // Streaming state
  streamingProgress: null,
  streamingTokenCount: 0,
  // Refinement state
  refinementInProgress: false,
  refinementError: null,
  conversationHistory: [],
}

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    updateOnboarding: (state, action) => {
      state.onboardingData = { ...state.onboardingData, ...action.payload }
      storage.set(storage.keys.ONBOARDING, state.onboardingData)
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null
      state.streamingProgress = null
      state.streamingTokenCount = 0
      state.conversationHistory = []
    },
    clearError: (state) => {
      state.error = null
    },
    clearSavedTrips: (state) => {
      state.savedTrips = []
    },
    clearConversation: (state) => {
      state.conversationHistory = []
    },
    // Streaming actions — dispatched directly from within the streaming thunk
    streamStarted: (state) => {
      state.loading = true
      state.error = null
      state.streamingProgress = null
      state.streamingTokenCount = 0
      state.currentTrip = null
      state.conversationHistory = []
    },
    streamProgress: (state, action) => {
      state.streamingProgress = action.payload
    },
    streamTokenCount: (state, action) => {
      state.streamingTokenCount = action.payload
    },
    streamCompleted: (state, action) => {
      state.loading = false
      state.currentTrip = action.payload
      state.streamingProgress = null
    },
    streamAborted: (state) => {
      state.loading = false
      state.streamingProgress = null
      state.streamingTokenCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Non-streaming generation (fallback path) ──────────────────────────
      .addCase(generateItinerary.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.currentRequestId = action.meta.requestId
      })
      .addCase(generateItinerary.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return
        state.loading = false
        state.currentTrip = action.payload
        state.currentRequestId = null
      })
      .addCase(generateItinerary.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return
        if (action.meta.aborted) {
          state.loading = false
          state.currentRequestId = null
          return
        }
        state.loading = false
        state.error = action.payload
        state.currentRequestId = null
      })
      // ── Streaming generation ──────────────────────────────────────────────
      // Primary state updates are from synchronous actions (streamStarted/streamCompleted/streamAborted).
      // The thunk's rejected case is the safety net for failures before any callback fires.
      .addCase(generateItineraryStreaming.rejected, (state, action) => {
        if (action.meta.aborted) return // handled by streamAborted
        if (!state.loading) return      // already handled (e.g., streamCompleted fired)
        state.loading = false
        state.error = action.payload || 'Streaming failed'
        state.streamingProgress = null
      })
      // ── Refinement ────────────────────────────────────────────────────────
      .addCase(refineCurrentItinerary.pending, (state, action) => {
        state.refinementInProgress = true
        state.refinementError = null
        // Optimistically add user message to conversation
        state.conversationHistory = [
          ...state.conversationHistory,
          {
            role: 'user',
            content: action.meta.arg,
            timestamp: new Date().toISOString(),
          },
        ]
      })
      .addCase(refineCurrentItinerary.fulfilled, (state, action) => {
        state.refinementInProgress = false
        state.currentTrip = action.payload.updated
        state.conversationHistory = [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: 'Updated your itinerary ✓',
            timestamp: new Date().toISOString(),
          },
        ]
      })
      .addCase(refineCurrentItinerary.rejected, (state, action) => {
        state.refinementInProgress = false
        state.refinementError = action.payload
        state.conversationHistory = [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: `Something went wrong: ${action.payload}`,
            timestamp: new Date().toISOString(),
          },
        ]
      })
      // ── Persistence thunks ────────────────────────────────────────────────
      .addCase(loadUserTrips.fulfilled, (state, action) => {
        state.savedTrips = action.payload
      })
      .addCase(saveTrip.fulfilled, (state, action) => {
        state.savedTrips = action.payload
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.savedTrips = action.payload
      })
      .addCase(duplicateTrip.fulfilled, (state, action) => {
        state.savedTrips = action.payload
      })
  },
})

export const {
  updateOnboarding,
  clearCurrentTrip,
  clearError,
  clearSavedTrips,
  clearConversation,
  streamStarted,
  streamProgress,
  streamTokenCount,
  streamCompleted,
  streamAborted,
} = tripSlice.actions

export default tripSlice.reducer
