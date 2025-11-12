import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500'></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Web application role restrictions
  const allowedRoles = ['Admin', 'StationManager', 'CSStaff']

  if (!allowedRoles.includes(user.role)) {
    // EVDriver and other roles are not allowed in web application
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Access Denied
          </h2>
          <p className='text-gray-600 mb-4'>
            Web access is restricted to staff members only.
          </p>
          <p className='text-gray-600'>
            Please use the mobile application for customer access.
          </p>
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Insufficient Permissions
          </h2>
          <p className='text-gray-600'>
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
