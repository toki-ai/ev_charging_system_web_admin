// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://localhost:7000/api'

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Stations
  STATIONS: {
    GET_ALL: '/stations',
    GET_BY_ID: (id) => `/stations/${id}`,
    CREATE: '/stations',
    UPDATE: (id) => `/stations/${id}`,
    DELETE: (id) => `/stations/${id}`,
    GET_BY_STAFF: (staffId) => `/stations/staff/${staffId}`,
  },

  // Sessions
  SESSIONS: {
    GET_ALL: '/sessions',
    GET_BY_ID: (id) => `/sessions/${id}`,
    CREATE: '/sessions',
    UPDATE: (id) => `/sessions/${id}`,
    DELETE: (id) => `/sessions/${id}`,
    GET_BY_STATION: (stationId) => `/sessions/station/${stationId}`,
    STOP: (id) => `/sessions/${id}/stop`,
  },

  // Reports
  REPORTS: {
    GET_ALL: '/reports',
    CREATE: '/reports',
    GET_TECHNICAL: '/reports/technical',
    GET_MAINTENANCE: '/reports/maintenance',
    GET_USAGE: '/reports/usage',
    GET_REVENUE: '/reports/revenue',
  },

  // Packages
  PACKAGES: {
    GET_ALL: '/packages',
    GET_BY_ID: (id) => `/packages/${id}`,
    CREATE: '/packages',
    UPDATE: (id) => `/packages/${id}`,
    DELETE: (id) => `/packages/${id}`,
  },
}

export const USER_ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
}

export const SESSION_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  PAUSED: 'Paused',
}

export const REPORT_TYPES = {
  TECHNICAL: 'Technical',
  MAINTENANCE: 'Maintenance',
  ISSUE: 'Issue',
}
