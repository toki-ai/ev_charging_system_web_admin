import axios from 'axios'

/**
 * Dashboard Service - Fetches real data from backend APIs
 *
 * IMPLEMENTED FEATURES (using real backend data):
 * ✅ Station data: total stations, chargers, issues from StationService
 * ✅ Session statistics: total sessions, revenue, growth from ChargingSessionService
 * ✅ Maintenance logs: from StationService maintenance endpoints
 * ✅ Usage reports: calculated from real station and session data
 * ✅ Revenue reports: calculated from real charging session data
 * ✅ Recent activities: from real charging session data
 *
 * NOT IMPLEMENTED (using mock data):
 * ❌ Vehicle type statistics (backend doesn't track vehicle models)
 * ❌ Peak hour analysis (no timestamp-based analytics endpoints)
 * ❌ Connector type usage (no detailed connector analytics)
 */

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
    console.error('❌ Dashboard API error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.Error || error.message,
    })

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.clear()

      // Only redirect if not already on login page
      if (
        window.location.pathname !== '/login' &&
        !window.location.pathname.includes('/login')
      ) {
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export const dashboardService = {
  // Get all stations with aggregated data
  async getStationsData() {
    try {
      console.log('📊 Fetching stations data for dashboard...')
      const response = await apiClient.get('/stations')

      if (response.data) {
        const stations = response.data

        // Calculate dashboard stats from stations
        const totalChargers = stations.reduce(
          (sum, station) => sum + (station.totalChargers || 0),
          0
        )
        const activeChargers = stations.reduce(
          (sum, station) => sum + (station.availableChargers || 0),
          0
        )
        const totalStations = stations.length
        const activeStations = stations.filter(
          (s) => s.status === 'Active'
        ).length

        // Calculate issues (assuming chargers with status other than Available are issues)
        let reportedIssues = 0
        stations.forEach((station) => {
          if (station.chargers) {
            reportedIssues += station.chargers.filter(
              (c) =>
                c.status === 'Offline' ||
                c.status === 'Maintenance' ||
                c.status === 'Error'
            ).length
          }
        })

        console.log('✅ Stations data fetched successfully:', {
          totalStations,
          activeStations,
          totalChargers,
          activeChargers,
          reportedIssues,
        })

        return {
          success: true,
          data: {
            stations,
            stats: {
              totalStations,
              activeStations,
              totalChargers,
              activeChargers,
              reportedIssues,
            },
          },
        }
      }

      return {
        success: false,
        error: 'No data received',
      }
    } catch (error) {
      console.error('❌ Get stations data error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to load stations data',
      }
    }
  },

  // Get all charging sessions for dashboard analysis
  async getSessionsData() {
    try {
      console.log('📊 Fetching sessions data for dashboard...')
      const response = await apiClient.get('/sessions')

      if (response.data) {
        const sessions = response.data

        // Calculate session statistics
        const totalSessions = sessions.length
        const completedSessions = sessions.filter(
          (s) => s.status === 'Completed'
        ).length
        const activeSessions = sessions.filter(
          (s) => s.status === 'InProgress'
        ).length

        // Calculate total energy and revenue from completed sessions
        const totalEnergy = sessions
          .filter((s) => s.status === 'Completed')
          .reduce((sum, session) => sum + (session.energyConsumed || 0), 0)

        const totalRevenue = sessions
          .filter((s) => s.status === 'Completed')
          .reduce((sum, session) => sum + (session.cost || 0), 0)

        // Group sessions by station for usage analysis
        const sessionsByStation = {}
        sessions.forEach((session) => {
          const stationId = session.stationId
          if (!sessionsByStation[stationId]) {
            sessionsByStation[stationId] = {
              stationId,
              sessions: [],
              totalSessions: 0,
              totalRevenue: 0,
              totalEnergy: 0,
            }
          }

          sessionsByStation[stationId].sessions.push(session)
          sessionsByStation[stationId].totalSessions++

          if (session.status === 'Completed') {
            sessionsByStation[stationId].totalRevenue += session.cost || 0
            sessionsByStation[stationId].totalEnergy +=
              session.energyConsumed || 0
          }
        })

        // Calculate monthly growth (simplified - compare current month with previous month)
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const currentMonthSessions = sessions.filter((s) => {
          const sessionDate = new Date(s.startTime)
          return (
            sessionDate.getMonth() === currentMonth &&
            sessionDate.getFullYear() === currentYear
          )
        })

        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const previousMonthSessions = sessions.filter((s) => {
          const sessionDate = new Date(s.startTime)
          return (
            sessionDate.getMonth() === previousMonth &&
            sessionDate.getFullYear() === previousYear
          )
        })

        const monthlyGrowth =
          previousMonthSessions.length > 0
            ? ((currentMonthSessions.length - previousMonthSessions.length) /
                previousMonthSessions.length) *
              100
            : 0

        const currentMonthRevenue = currentMonthSessions
          .filter((s) => s.status === 'Completed')
          .reduce((sum, s) => sum + (s.cost || 0), 0)

        const previousMonthRevenue = previousMonthSessions
          .filter((s) => s.status === 'Completed')
          .reduce((sum, s) => sum + (s.cost || 0), 0)

        const revenueGrowth =
          previousMonthRevenue > 0
            ? ((currentMonthRevenue - previousMonthRevenue) /
                previousMonthRevenue) *
              100
            : 0

        console.log('✅ Sessions data fetched successfully:', {
          totalSessions,
          completedSessions,
          activeSessions,
          totalEnergy,
          totalRevenue,
          monthlyGrowth: monthlyGrowth.toFixed(1),
          revenueGrowth: revenueGrowth.toFixed(1),
        })

        return {
          success: true,
          data: {
            sessions,
            sessionsByStation,
            stats: {
              totalSessions,
              completedSessions,
              activeSessions,
              totalEnergy,
              totalRevenue,
              monthlyGrowth,
              revenueGrowth,
            },
          },
        }
      }

      return {
        success: false,
        error: 'No sessions data received',
      }
    } catch (error) {
      console.error('❌ Get sessions data error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to load sessions data',
      }
    }
  },

  // Get payment data for revenue analysis
  async getPaymentData() {
    try {
      console.log('📊 Fetching payment data for dashboard...')
      const response = await apiClient.get('/payments?pageSize=1000') // Get large batch of payments

      if (response.data && response.data.payments) {
        const payments = response.data.payments

        // Analyze payments by method
        const paymentsByMethod = {}
        const revenueBySource = {
          chargingSessions: 0,
          subscriptions: 0,
        }
        const paymentMethodRevenue = {}

        payments.forEach((payment) => {
          const method = payment.paymentMethod || 'Unknown'
          const amount = payment.totalAmount || payment.amount || 0
          const description = payment.description || ''

          // Count payments by method
          if (!paymentsByMethod[method]) {
            paymentsByMethod[method] = {
              count: 0,
              totalAmount: 0,
            }
          }
          paymentsByMethod[method].count++
          paymentsByMethod[method].totalAmount += amount

          // Revenue by method
          if (!paymentMethodRevenue[method]) {
            paymentMethodRevenue[method] = 0
          }
          paymentMethodRevenue[method] += amount

          // Categorize by revenue source based on description
          if (
            description.includes('Thanh toán phiên sạc') ||
            description.includes('charging session') ||
            description.toLowerCase().includes('session')
          ) {
            revenueBySource.chargingSessions += amount
          } else if (
            description.includes('Upgrade subscription') ||
            description.includes('Nâng cấp subscription') ||
            description.toLowerCase().includes('subscription')
          ) {
            revenueBySource.subscriptions += amount
          }
        })

        // Calculate total revenue
        const totalRevenue = payments.reduce(
          (sum, p) => sum + (p.totalAmount || p.amount || 0),
          0
        )

        // Calculate percentages for payment methods
        const paymentMethodStats = Object.entries(paymentMethodRevenue)
          .map(([method, amount]) => ({
            method,
            amount,
            percentage:
              totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0,
            count: paymentsByMethod[method]?.count || 0,
          }))
          .sort((a, b) => b.amount - a.amount) // Sort by revenue descending

        console.log('✅ Payment data analyzed successfully:', {
          totalPayments: payments.length,
          totalRevenue,
          paymentMethodStats,
          revenueBySource,
        })

        return {
          success: true,
          data: {
            payments,
            totalRevenue,
            paymentsByMethod,
            paymentMethodStats,
            revenueBySource,
            stats: {
              totalPayments: payments.length,
              completedPayments: payments.filter(
                (p) => p.status === 'Completed'
              ).length,
              totalRevenue,
            },
          },
        }
      }

      return {
        success: false,
        error: 'No payment data received',
      }
    } catch (error) {
      console.error('❌ Get payment data error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to load payment data',
      }
    }
  },

  // Get maintenance logs for dashboard
  async getMaintenanceData() {
    try {
      console.log('📊 Fetching maintenance data for dashboard...')
      const response = await apiClient.get('/stations/maintenance')

      if (response.data) {
        const maintenanceLogs = response.data

        // Calculate maintenance statistics
        const totalLogs = maintenanceLogs.length
        const pendingMaintenance = maintenanceLogs.filter(
          (log) => log.status === 'Scheduled'
        ).length
        const completedMaintenance = maintenanceLogs.filter(
          (log) => log.status === 'Completed'
        ).length
        const inProgressMaintenance = maintenanceLogs.filter(
          (log) => log.status === 'InProgress'
        ).length

        console.log('✅ Maintenance data fetched successfully:', {
          totalLogs,
          pendingMaintenance,
          completedMaintenance,
          inProgressMaintenance,
        })

        return {
          success: true,
          data: {
            maintenanceLogs,
            stats: {
              totalLogs,
              pendingMaintenance,
              completedMaintenance,
              inProgressMaintenance,
            },
          },
        }
      }

      return {
        success: false,
        error: 'No maintenance data received',
      }
    } catch (error) {
      console.error('❌ Get maintenance data error:', error)
      return {
        success: false,
        error:
          error.response?.data?.Error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to load maintenance data',
      }
    }
  },

  // Get combined dashboard data
  async getDashboardData() {
    try {
      console.log('📊 Fetching complete dashboard data...')

      // Fetch all data in parallel
      const [stationsResult, sessionsResult, maintenanceResult, paymentResult] =
        await Promise.allSettled([
          this.getStationsData(),
          this.getSessionsData(),
          this.getMaintenanceData(),
          this.getPaymentData(),
        ])

      const dashboardData = {
        stations: {
          success:
            stationsResult.status === 'fulfilled' &&
            stationsResult.value.success,
          data:
            stationsResult.status === 'fulfilled' &&
            stationsResult.value.success
              ? stationsResult.value.data
              : null,
          error:
            stationsResult.status === 'rejected' ||
            !stationsResult.value?.success
              ? stationsResult.reason || stationsResult.value?.error
              : null,
        },
        sessions: {
          success:
            sessionsResult.status === 'fulfilled' &&
            sessionsResult.value.success,
          data:
            sessionsResult.status === 'fulfilled' &&
            sessionsResult.value.success
              ? sessionsResult.value.data
              : null,
          error:
            sessionsResult.status === 'rejected' ||
            !sessionsResult.value?.success
              ? sessionsResult.reason || sessionsResult.value?.error
              : null,
        },
        maintenance: {
          success:
            maintenanceResult.status === 'fulfilled' &&
            maintenanceResult.value.success,
          data:
            maintenanceResult.status === 'fulfilled' &&
            maintenanceResult.value.success
              ? maintenanceResult.value.data
              : null,
          error:
            maintenanceResult.status === 'rejected' ||
            !maintenanceResult.value?.success
              ? maintenanceResult.reason || maintenanceResult.value?.error
              : null,
        },
        payments: {
          success:
            paymentResult.status === 'fulfilled' && paymentResult.value.success,
          data:
            paymentResult.status === 'fulfilled' && paymentResult.value.success
              ? paymentResult.value.data
              : null,
          error:
            paymentResult.status === 'rejected' || !paymentResult.value?.success
              ? paymentResult.reason || paymentResult.value?.error
              : null,
        },
      }

      console.log('📊 Dashboard data summary:', {
        stationsSuccess: dashboardData.stations.success,
        sessionsSuccess: dashboardData.sessions.success,
        maintenanceSuccess: dashboardData.maintenance.success,
        paymentsSuccess: dashboardData.payments.success,
      })

      return {
        success: true,
        data: dashboardData,
      }
    } catch (error) {
      console.error('❌ Get dashboard data error:', error)
      return {
        success: false,
        error: error.message || 'Failed to load dashboard data',
      }
    }
  },
}
