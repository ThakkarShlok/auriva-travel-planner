import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { streamItinerary } from '../../services/streamingService'
import { storage } from '../../services/localStorageService'
import {
  listTrips,
  saveTrip as apiSaveTrip,
  deleteTrip as apiDeleteTrip,
  duplicateTrip as apiDuplicateTrip,
} from '../../services/tripsService'

const loadOnboardingData = () =>
  storage.get(storage.keys.ONBOARDING) || {
    destination: '',
    duration: 3,
    budget: 'moderate',
    travelers: 2,
    interests: '',
  }

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const generateItineraryStreaming = createAsyncThunk(
  'trip/generateStreaming',
  async (preferences, { dispatch, signal, rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      dispatch(tripSlice.actions.streamStarted())

      streamItinerary(preferences, {
        signal,
        onPartialJson: (partial) => dispatch(tripSlice.actions.streamProgress(partial)),
        onToken: (_, accumulated) => dispatch(tripSlice.actions.streamTokenCount(accumulated.length)),
        onDone: (final) => {
          dispatch(tripSlice.actions.streamCompleted(final))
          resolve(final)
        },
        onError: (msg) => {
          reject(new Error(msg))
        },
      })
    }).catch((err) => rejectWithValue(err.message))
  }
)

// Fetch saved trips from Neon via API
export const fetchSavedTrips = createAsyncThunk(
  'trip/fetchSaved',
  async (_, { rejectWithValue, extra }) => {
    try {
      return await listTrips(extra.getToken)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Persist a newly generated trip to Neon
export const persistTrip = createAsyncThunk(
  'trip/persist',
  async ({ preferences, generated }, { rejectWithValue, extra }) => {
    try {
      return await apiSaveTrip({ preferences, generated }, extra.getToken)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete a trip from Neon
export const removeTrip = createAsyncThunk(
  'trip/remove',
  async (tripId, { rejectWithValue, extra }) => {
    try {
      await apiDeleteTrip(tripId, extra.getToken)
      return tripId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Duplicate a trip in Neon
export const cloneTrip = createAsyncThunk(
  'trip/clone',
  async (tripId, { rejectWithValue, extra }) => {
    try {
      return await apiDuplicateTrip(tripId, extra.getToken)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  // In-flight streaming generation
  currentTrip: null,
  loading: false,
  error: null,
  currentRequestId: null,
  streamingProgress: null,
  streamingTokenCount: 0,
  // Saved trips (from Neon via API)
  savedTrips: [],
  tripsLoading: false,
  tripsError: null,
  // Onboarding preferences (localStorage — pre-generation state, not trip data)
  onboardingData: loadOnboardingData(),
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
    },
    clearError: (state) => {
      state.error = null
    },
    clearSavedTrips: (state) => {
      state.savedTrips = []
    },
    // Streaming actions — dispatched synchronously from within the streaming thunk
    streamStarted: (state) => {
      state.loading = true
      state.error = null
      state.streamingProgress = null
      state.streamingTokenCount = 0
      state.currentTrip = null
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
      // ── Streaming generation ──────────────────────────────────────────────
      .addCase(generateItineraryStreaming.rejected, (state, action) => {
        if (action.meta.aborted) return
        if (!state.loading) return
        state.loading = false
        state.error = action.payload || 'Streaming failed'
        state.streamingProgress = null
      })
      // ── Fetch saved trips ─────────────────────────────────────────────────
      .addCase(fetchSavedTrips.pending, (state) => {
        state.tripsLoading = true
        state.tripsError = null
      })
      .addCase(fetchSavedTrips.fulfilled, (state, action) => {
        state.tripsLoading = false
        state.savedTrips = action.payload
      })
      .addCase(fetchSavedTrips.rejected, (state, action) => {
        state.tripsLoading = false
        state.tripsError = action.payload || 'Failed to load trips'
      })
      // ── Persist new trip ──────────────────────────────────────────────────
      .addCase(persistTrip.fulfilled, (state, action) => {
        state.savedTrips = [action.payload, ...state.savedTrips]
      })
      // ── Remove trip ───────────────────────────────────────────────────────
      .addCase(removeTrip.fulfilled, (state, action) => {
        state.savedTrips = state.savedTrips.filter(t => t.id !== action.payload)
      })
      // ── Clone trip ────────────────────────────────────────────────────────
      .addCase(cloneTrip.fulfilled, (state, action) => {
        state.savedTrips = [action.payload, ...state.savedTrips]
      })
  },
})

export const {
  updateOnboarding,
  clearCurrentTrip,
  clearError,
  clearSavedTrips,
  streamStarted,
  streamProgress,
  streamTokenCount,
  streamCompleted,
  streamAborted,
} = tripSlice.actions

export default tripSlice.reducer
