// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import tripReducer from './slices/tripSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    trip: tripReducer,
    auth: authReducer,
  },
})