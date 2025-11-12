import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext()

const initialState = {
  user: null,
  loading: false,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'LOGIN_FAILURE':
      return { ...state, user: null, loading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const result = await authService.login(credentials)

      if (result.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.data.user })
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.error })
      }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Network error. Please try again.',
      })
    }
  }

  const logout = async () => {
    try {
      authService.logout()
      dispatch({ type: 'LOGOUT' })
      // Redirect to login page after logout
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getStoredUser()
    const token = authService.getStoredToken()

    if (token && storedUser) {
      // Validate token by checking if it's expired
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000

        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser })
        } else {
          // Token expired, clear storage
          authService.logout()
        }
      } catch (error) {
        console.error('Token validation error:', error)
        authService.logout()
      }
    }
  }, [])

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    isAuthenticated: !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
