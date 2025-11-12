import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StaffDashboard from './pages/StaffDashboard.jsx'
import AccountManagement from './pages/AccountManagement.jsx'
import SubscriptionManagement from './pages/SubscriptionManagement.jsx'
import SessionManagement from './pages/SessionManagement.jsx'
import StationManagement from './pages/StationManagement.jsx'
import MaintenanceLog from './pages/MaintenanceLog.jsx'
import { useAuth } from './context/AuthContext.jsx'

function DashboardRouter() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path='/dashboard'
          element={
            user?.role === 'Admin' ? <AdminDashboard /> : <StaffDashboard />
          }
        />

        <Route
          path='/accounts'
          element={
            <ProtectedRoute requiredRole='Admin'>
              <AccountManagement />
            </ProtectedRoute>
          }
        />

        <Route path='/subscriptions' element={<SubscriptionManagement />} />

        <Route path='/sessions' element={<SessionManagement />} />

        <Route
          path='/stations'
          element={
            <ProtectedRoute requiredRole='Admin'>
              <StationManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path='/maintenance'
          element={
            <ProtectedRoute requiredRole='Admin'>
              <MaintenanceLog />
            </ProtectedRoute>
          }
        />

        <Route
          path='/calendar'
          element={
            <div className='p-6'>
              <h1 className='text-2xl font-bold'>Calendar</h1>
              <p>Calendar view will be implemented here.</p>
            </div>
          }
        />

        <Route
          path='/packages'
          element={
            <div className='p-6'>
              <h1 className='text-2xl font-bold'>Packages</h1>
              <p>Package management will be implemented here.</p>
            </div>
          }
        />

        <Route path='/' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </DashboardLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route
            path='/unauthorized'
            element={
              <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                  <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                    Unauthorized
                  </h1>
                  <p className='text-gray-600'>
                    You don't have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path='/*'
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
