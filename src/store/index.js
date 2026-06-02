import { configureStore } from '@reduxjs/toolkit'
import tripReducer from './slices/tripSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    trip: tripReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})