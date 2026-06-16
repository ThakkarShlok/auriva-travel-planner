import { configureStore } from '@reduxjs/toolkit'
import tripReducer from './slices/tripSlice'
import authReducer from './authSlice'

// Clerk's getToken is a hook — can't call it inside thunks directly.
// ClerkSyncBridge calls setTokenGetter(getToken) on every auth state change,
// making the current token getter available to all thunks via extra.getToken.
let tokenGetter = async () => null

export function setTokenGetter(fn) {
  tokenGetter = fn
}

export const store = configureStore({
  reducer: {
    trip: tripReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          getToken: () => tokenGetter(),
        },
      },
    }),
})
