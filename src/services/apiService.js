import axios from 'axios'

// Base API URL for all services via API Gateway
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
    console.log('=== REQUEST DEBUG ===')
    console.log('Base URL:', config.baseURL)
    console.log('URL:', config.url)
    console.log('Full URL:', config.baseURL + config.url)
    console.log('Method:', config.method)
    console.log('Token exists:', !!token)
    console.log('Token preview:', token?.substring(0, 50))
    console.log('====================')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set')
    } else {
      console.log('NO TOKEN FOUND!')
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
    console.log('=== API ERROR DEBUG ===')
    console.log('Status:', error.response?.status)
    console.log('Status Text:', error.response?.statusText)
    console.log('URL:', error.config?.url)
    console.log('Method:', error.config?.method)
    console.log('Response Data:', error.response?.data)
    console.log('Headers:', error.response?.headers)
    console.log('======================')

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect
      console.log('401 Unauthorized - Clearing token and redirecting to login')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.clear()

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission, don't logout
      console.log('403 Forbidden - User lacks permission for this operation')
    } else {
      // Other errors - log for debugging
      console.log('Other API error:', error.response?.status, error.message)
    }
    return Promise.reject(error)
  }
)

export const accountService = {
  // Get all users (Admin only)
  async getAllUsers() {
    try {
      const response = await apiClient.get('/users')

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get all users error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to get users',
      }
    }
  },

  // Create staff account
  async createStaff(staffData) {
    try {
      console.log('Creating staff with data:', staffData)

      // Ensure all required fields are present and properly typed
      if (
        !staffData.email ||
        !staffData.password ||
        !staffData.fullName ||
        !staffData.phone ||
        !staffData.stationId
      ) {
        throw new Error('Missing required fields')
      }

      // Use staff creation endpoint
      const payload = {
        email: staffData.email.trim(),
        password: staffData.password,
        fullName: staffData.fullName.trim(),
        phone: staffData.phone.trim(),
        stationId: parseInt(staffData.stationId), // Ensure it's an integer
        role: staffData.role || 'CSStaff',
      }

      console.log('Staff creation payload:', payload)

      const response = await apiClient.post('/users/staff', payload)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Create staff error:', error)
      console.error('Error response:', error.response?.data)

      // Extract the actual error message from the response
      let errorMessage = 'Failed to create staff'

      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          // Handle validation errors array
          const validationErrors = error.response.data
            .map((err) => err.description || err.message || JSON.stringify(err))
            .join(', ')
          errorMessage = `Validation errors: ${validationErrors}`
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.Error) {
          errorMessage = error.response.data.Error
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  // Update user (Admin only)
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, {
        fullName: userData.fullName,
        phone: userData.phone,
        stationId: userData.stationId ? parseInt(userData.stationId) : null,
        role: userData.role,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Update user error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to update user',
      }
    }
  },

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Delete user error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to delete user',
      }
    }
  },

  // Search user by phone
  async searchByPhone(phone) {
    try {
      const response = await apiClient.get(
        `/users/search?phone=${encodeURIComponent(phone)}`
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Search by phone error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'User not found',
      }
    }
  },
}

export const subscriptionService = {
  // Get all subscriptions (Admin only)
  async getAllSubscriptions(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)

      const response = await apiClient.get(`/subscriptions?${params}`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get all subscriptions error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get subscriptions',
      }
    }
  },

  // Get subscription by ID
  async getSubscriptionById(id) {
    try {
      const response = await apiClient.get(`/subscriptions/${id}`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get subscription by ID error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get subscription',
      }
    }
  },

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await apiClient.post('/subscriptions', {
        userId: subscriptionData.userId,
        type: subscriptionData.type,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        price: parseFloat(subscriptionData.price),
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Create subscription error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription',
      }
    }
  },

  // Update subscription
  async updateSubscription(id, subscriptionData) {
    try {
      const response = await apiClient.put(`/subscriptions/${id}`, {
        type: subscriptionData.type,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        price: parseFloat(subscriptionData.price),
        isActive: subscriptionData.isActive,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Update subscription error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to update subscription',
      }
    }
  },

  // Delete subscription
  async deleteSubscription(id) {
    try {
      const response = await apiClient.delete(`/subscriptions/${id}`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Delete subscription error:', error)
      return {
        success: false,
        error: error.response?.data?.Error || 'Failed to delete subscription',
      }
    }
  },
}

// Payment Service
export const paymentService = {
  // Get all payments (Admin only)
  async getAllPayments(page = 1, pageSize = 100, status = null) {
    try {
      console.log('📊 Fetching all payments for dashboard...')
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      if (status) params.append('status', status)

      const response = await apiClient.get(`/payments?${params}`)

      console.log('✅ Payments data fetched successfully:', response.data)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Get payments error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to load payments',
      }
    }
  },

  // Create payment for subscription upgrade
  async createPayment(paymentData) {
    try {
      console.log('=== API Service: Creating payment ===')
      console.log('Input payment data:', paymentData)
      console.log('Payment purpose detected:', paymentData.paymentType)
      console.log('Raw amount:', paymentData.amount)
      console.log('Parsed amount:', parseFloat(paymentData.amount))
      console.log('API base URL:', apiClient.defaults.baseURL)
      console.log(
        'Authorization header exists:',
        !!apiClient.defaults.headers.common['Authorization']
      )

      // Map payment method to PaymentMethodId as string (required by backend DTO)
      let paymentMethodId = null
      switch (paymentData.paymentMethod) {
        case 'Thẻ tín dụng':
          paymentMethodId = '1' // String as expected by CreatePaymentDto
          break
        case 'MoMo':
          paymentMethodId = '2' // String as expected by CreatePaymentDto
          break
        case 'ZaloPay':
          paymentMethodId = '3' // String as expected by CreatePaymentDto
          break
        case 'Tiền mặt':
          paymentMethodId = null // Cash doesn't need PaymentMethodId
          break
        default:
          paymentMethodId = '1' // Default to first payment method as string
      }

      const requestPayload = {
        sessionId: paymentData.sessionId.toString(),
        userId: paymentData.userId,
        userEmail: paymentData.userEmail,
        amount: parseFloat(paymentData.amount),
        currency: 'VND', // Required field in CreatePaymentDto
        paymentMethod: paymentData.paymentMethod,
        paymentGateway: paymentData.paymentGateway || 'internal',
        description: paymentData.description,
        paymentType: paymentData.paymentType || 'ChargingSession',
      }

      // Add paymentMethodId only if it exists (not null for cash payments)
      if (paymentMethodId !== null) {
        requestPayload.paymentMethodId = paymentMethodId
      }

      // Add subscription-specific fields only if they exist
      if (paymentData.subscriptionId) {
        requestPayload.subscriptionId = paymentData.subscriptionId
      }
      if (paymentData.subscriptionType) {
        requestPayload.subscriptionType = paymentData.subscriptionType
      }
      if (paymentData.previousSubscriptionType) {
        requestPayload.previousSubscriptionType =
          paymentData.previousSubscriptionType
      }

      console.log('Request payload to send:', requestPayload)
      console.log('Making POST request to /payments...')

      const response = await apiClient.post('/payments', requestPayload)

      console.log('API response received:', response)
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Create payment error:', error)
      console.error('Error response:', error.response?.data)
      console.error(
        'Error response FULL:',
        JSON.stringify(error.response?.data, null, 2)
      )
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      console.error('Request that failed:', error.config?.data)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          error.response?.data ||
          'Failed to create payment',
      }
    }
  },
}

// Station service for getting all stations
export const stationService = {
  async getAllStations() {
    try {
      const response = await apiClient.get('/stations')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get stations error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to load stations',
      }
    }
  },

  async updateStation(stationId, stationData) {
    try {
      const response = await apiClient.put(
        `/stations/${stationId}`,
        stationData
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Update station error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to update station',
      }
    }
  },

  async updateChargerStatus(chargerId, status) {
    try {
      const response = await apiClient.put(
        `/stations/chargers/${chargerId}/status`,
        { status }
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Update charger status error:', error)

      let errorMessage = 'Failed to update charger status'

      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update charger status'
      } else if (error.response?.status === 404) {
        errorMessage = 'Charger not found'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.Error || 'Invalid status value'
      } else if (error.response?.data?.Error) {
        errorMessage = error.response.data.Error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  },
}

// Session service for managing charging sessions
export const sessionService = {
  // Get sessions for current user or all sessions for admin/staff
  async getSessions(userId = null, stationId = null) {
    try {
      let url = '/sessions'
      const params = new URLSearchParams()

      if (userId) {
        // Get sessions for a specific user
        url = `/sessions/user/${userId}`
      } else {
        // Get all sessions (for admin/staff) with optional station filter
        if (stationId) {
          params.append('stationId', stationId)
        }
        if (params.toString()) {
          url += '?' + params.toString()
        }
      }

      console.log('🔗 Calling GET', url)
      const response = await apiClient.get(url)

      console.log('✅ Sessions API response status:', response.status)
      console.log('📊 Sessions API response data:', response.data)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Get sessions error:', error)
      console.error('📡 Error response:', error.response?.data)

      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to load sessions',
      }
    }
  },

  // Start a new charging session
  async startSession(sessionData) {
    try {
      const payload = {
        userId: sessionData.userId,
        stationId: parseInt(sessionData.stationId),
        SOCStart: sessionData.socStart || 0,
      }

      console.log('🚀 Starting session with payload:', payload)
      const response = await apiClient.post('/sessions/start', payload)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Start session error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to start session',
      }
    }
  },

  // Stop a charging session
  async stopSession(sessionId, socEnd = 100) {
    try {
      const payload = {
        sessionId: parseInt(sessionId),
        socEnd: socEnd,
      }

      console.log('🛑 Stopping session with payload:', payload)
      const response = await apiClient.post('/sessions/stop', payload)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Stop session error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to stop session',
      }
    }
  },

  // Get session by ID
  async getSessionById(sessionId) {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Get session by ID error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to get session',
      }
    }
  },

  // Search users for session creation
  async searchUsers(searchTerm) {
    try {
      console.log('🔍 Searching users with term:', searchTerm)

      // If it's a phone number, try phone search first
      if (searchTerm.match(/^\d+$/)) {
        const phoneResult = await accountService.searchByPhone(searchTerm)
        if (
          phoneResult.success &&
          phoneResult.data &&
          phoneResult.data.length > 0
        ) {
          return phoneResult
        }
      }

      // For name/email search, get all users and filter client-side
      // This is a workaround until we have a proper search API
      try {
        const allUsersResult = await accountService.getAllUsers()

        if (allUsersResult.success) {
          const allUsers = allUsersResult.data || []

          // Filter users that match the search term (contains search)
          const filteredUsers = allUsers.filter((user) => {
            const searchLower = searchTerm.toLowerCase().trim()
            const fullName = (user.fullName || user.name || '').toLowerCase()
            const email = (user.email || '').toLowerCase()
            const phone = (user.phone || '').toLowerCase()

            return (
              fullName.includes(searchLower) ||
              email.includes(searchLower) ||
              phone.includes(searchLower)
            )
          })

          console.log(`✅ Found ${filteredUsers.length} matching users`)

          return {
            success: true,
            data: filteredUsers,
          }
        }
      } catch (getAllError) {
        console.log('⚠️ getAllUsers failed, trying individual search methods')
      }

      // Fallback: return empty if no matches found
      return {
        success: true,
        data: [],
      }
    } catch (error) {
      console.error('❌ Search users error:', error)
      return {
        success: false,
        error: 'Failed to search users',
      }
    }
  },
}

// Maintenance service for managing maintenance logs
export const maintenanceService = {
  async getAllMaintenanceLogs() {
    try {
      console.log('🔗 Calling GET /stations/maintenance')
      console.log('🌍 Base URL:', apiClient.defaults.baseURL)
      console.log(
        '🔑 Has auth header:',
        !!apiClient.defaults.headers.common['Authorization']
      )

      const response = await apiClient.get('/stations/maintenance')

      console.log('✅ Maintenance API response status:', response.status)
      console.log('📊 Maintenance API response data:', response.data)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('❌ Get maintenance logs error:', error)
      console.error('📡 Error response:', error.response?.data)
      console.error('📊 Error status:', error.response?.status)
      console.error('🌐 Error config URL:', error.config?.url)

      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to load maintenance logs',
      }
    }
  },

  async createMaintenanceLog(logData) {
    try {
      const response = await apiClient.post('/stations/maintenance', logData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Create maintenance log error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to create maintenance log',
      }
    }
  },

  async updateMaintenanceLog(logId, updateData) {
    try {
      const response = await apiClient.put(
        `/stations/maintenance/${logId}`,
        updateData
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Update maintenance log error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to update maintenance log',
      }
    }
  },
}

// Vehicle Service
export const vehicleService = {
  async getUserVehicles(userId) {
    try {
      const response = await apiClient.get(`/vehicles/user/${userId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get user vehicles error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          'Failed to load vehicles',
      }
    }
  },
}
