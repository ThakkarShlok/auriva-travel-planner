import { createSlice } from '@reduxjs/toolkit'

// Phase 7A: auth is handled by Clerk. This slice is kept as the Redux
// source of truth that all existing components read from. ClerkSyncBridge
// keeps it in sync with Clerk's live auth state.
// Phase 7B removes this slice once all components read from Clerk directly.

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    clearUser: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
    clearError: () => {},
  },
})

export const { setUser, clearUser, clearError } = authSlice.actions
export default authSlice.reducer
