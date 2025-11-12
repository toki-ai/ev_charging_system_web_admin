import React, { useState } from 'react'
import { Menu, X, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      setShowUserMenu(false) // Close menu first
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className='bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50 px-6 sm:px-8 lg:px-10'>
      <div className='flex justify-between h-20'>
        <div className='flex items-center'>
          <button
            type='button'
            className='md:hidden inline-flex items-center justify-center p-3 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all duration-200'
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className='block h-6 w-6' />
            ) : (
              <Menu className='block h-6 w-6' />
            )}
          </button>

          <div className='ml-4 md:ml-0'>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
              {getPageTitle(window.location.pathname)}
            </h1>
          </div>
        </div>

        <div className='flex items-center space-x-6'>
          <button className='relative p-3 text-slate-400 hover:text-slate-500 transition-colors duration-200'>
            <Bell className='h-6 w-6' />
            <span className='absolute top-1 right-1 h-3 w-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse'></span>
          </button>

          <div className='relative'>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center p-2 text-sm rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            >
              <div className='h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3'>
                <span className='text-white text-base font-semibold'>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className='text-left'>
                <p className='font-semibold text-slate-900'>{user?.name}</p>
                <p className='text-xs text-slate-500'>{user?.role || 'User'}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className='absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50 border border-slate-200/50'>
                <div className='px-6 py-4 border-b border-slate-100'>
                  <p className='font-semibold text-slate-900'>{user?.name}</p>
                  <p className='text-slate-500 text-sm'>{user?.email}</p>
                  <p className='text-primary-600 text-xs font-medium mt-1'>
                    {user?.role || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200'
                >
                  <LogOut className='mr-3 h-5 w-5' />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getPageTitle(pathname) {
  const routes = {
    '/dashboard': 'Dashboard',
    '/stations': 'Charging Stations',
    '/sessions': 'Charging Sessions',
    '/reports': 'Reports',
    '/maintenance': 'Maintenance',
    '/settings': 'Settings',
    '/calendar': 'Calendar',
    '/packages': 'Packages',
  }

  return routes[pathname] || 'Dashboard'
}
