import axios from 'axios'

// Base API URL for UserService via API Gateway
const API_BASE_URL =
  process.env.REACT_APP_API_GATEWAY_URL || 'https://localhost:5000/api'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.clear()

      // Only redirect if not already on login page and not during initial load
      if (
        window.location.pathname !== '/login' &&
        !window.location.pathname.includes('/login')
      ) {
        // Use timeout to avoid redirect conflicts
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const { token, email, userId } = response.data

      // Store token
      localStorage.setItem('auth_token', token)

      // Create basic user data first
      const basicUserData = {
        id: userId,
        email: email,
        name: email, // temporary fallback
      }

      try {
        // Get user profile to get additional info
        const profileResponse = await apiClient.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userProfile = profileResponse.data

        // Parse JWT token to get role
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const userRole =
          tokenPayload[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] || 'User'

        const userData = {
          id: userId,
          email: email,
          name: userProfile.fullName || email,
          fullName: userProfile.fullName,
          phone: userProfile.phone,
          stationId: userProfile.stationId,
          role: userRole,
        }

        localStorage.setItem('user_data', JSON.stringify(userData))

        return {
          success: true,
          data: {
            token,
            user: userData,
          },
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile, using basic data:', profileError)

        // Parse JWT token to get role even if profile fails
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          const userRole =
            tokenPayload[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ] || 'User'

          const fallbackUserData = {
            ...basicUserData,
            role: userRole,
          }

          localStorage.setItem('user_data', JSON.stringify(fallbackUserData))

          return {
            success: true,
            data: {
              token,
              user: fallbackUserData,
            },
          }
        } catch (tokenError) {
          console.error('Failed to parse token:', tokenError)
          // Clear invalid token
          localStorage.removeItem('auth_token')
          return {
            success: false,
            error: 'Invalid token received. Please try again.',
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Login failed. Please try again.',
      }
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        address: userData.address,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          'Registration failed. Please try again.',
      }
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get profile error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to get profile.',
      }
    }
  },

  // Logout user
  logout() {
    try {
      // Clear all authentication data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      // Clear any other stored data if needed
      sessionStorage.clear()

      console.log('User logged out successfully')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    if (!token) return false

    try {
      // Check if token is expired
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      return tokenPayload.exp && tokenPayload.exp > currentTime
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  },

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('auth_token')
  },
}
