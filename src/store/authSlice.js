import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// Load auth state from localStorage
const loadAuthState = () => {
  const saved = localStorage.getItem('voyage_auth')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.expiry && new Date(parsed.expiry) > new Date()) {
      return { 
        isAuthenticated: true, 
        user: parsed.user,
        token: parsed.token
      }
    } else {
      localStorage.removeItem('voyage_auth')
    }
  }
  return { 
    isAuthenticated: false, 
    user: null,
    token: null,
    loading: false,
    error: null
  }
}

// Save auth state
const saveAuthState = (state) => {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)
  const toSave = {
    user: state.user,
    token: state.token,
    expiry: expiry.toISOString()
  }
  localStorage.setItem('voyage_auth', JSON.stringify(toSave))
}

// Mock user database
const getUsers = () => JSON.parse(localStorage.getItem('voyage_users') || '[]')
const saveUsers = (users) => localStorage.setItem('voyage_users', JSON.stringify(users))

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const users = getUsers()
      const user = users.find(u => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }
      
      const token = `token_${Date.now()}_${user.id}`
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        token: token
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const users = getUsers()
      
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists with this email')
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      }
      
      users.push(newUser)
      saveUsers(users)
      
      const token = `token_${Date.now()}_${newUser.id}`
      
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: token
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('voyage_auth')
  return null
})

const initialState = loadAuthState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.token = action.payload.token
        saveAuthState(state)
        toast.success(`Welcome back, ${action.payload.name}!`)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.token = action.payload.token
        saveAuthState(state)
        toast.success(`Welcome to Voyage AI, ${action.payload.name}!`)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
        toast.success('Logged out successfully')
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer