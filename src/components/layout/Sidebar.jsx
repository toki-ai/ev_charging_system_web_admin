import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Activity,
  Wrench,
  Zap,
  Calendar,
  Users,
  CreditCard,
  LogOut,
  User,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const getMenuItems = (userRole) => {
  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Subscriptions',
      href: '/subscriptions',
      icon: CreditCard,
      roles: ['Admin', 'StationManager', 'CSStaff'],
    },
  ]

  const roleSpecificItems = {
    Admin: [
      { name: 'Sessions', href: '/sessions', icon: Activity },
      { name: 'Stations', href: '/stations', icon: MapPin, adminOnly: true },
      {
        name: 'Account Management',
        href: '/accounts',
        icon: Users,
        adminOnly: true,
      },
      {
        name: 'Maintenance',
        href: '/maintenance',
        icon: Wrench,
        adminOnly: true,
      },
    ],
    StationManager: [
      { name: 'Sessions', href: '/sessions', icon: Activity },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
    ],
    CSStaff: [
      { name: 'Sessions', href: '/sessions', icon: Activity },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
    ],
  }

  const roleItems = roleSpecificItems[userRole] || roleSpecificItems.CSStaff

  // Combine common items with role-specific items
  const allItems = [...commonItems, ...roleItems]

  // Filter items based on role permissions
  return allItems.filter((item) => {
    if (item.adminOnly && userRole !== 'Admin') {
      return false
    }
    if (item.roles && !item.roles.includes(userRole)) {
      return false
    }
    return true
  })
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const menuItems = getMenuItems(user?.role)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      setShowUserMenu(false) // Close menu first
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className='hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30'>
      <div className='flex-1 flex flex-col min-h-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50'>
        <div className='flex-1 flex flex-col pt-6 pb-4 overflow-y-auto'>
          {/* Logo Section */}
          <div className='flex items-center flex-shrink-0 px-6 mb-10'>
            <div className='flex items-center'>
              <div className='h-10 w-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-primary-500/25'>
                <Zap className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-white text-xl font-bold tracking-tight'>
                  SmartEV
                </h1>
                <p className='text-slate-400 text-sm font-medium'>
                  Charge Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className='mt-2 flex-1 px-4 space-y-2'>
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                  }`
                }
              >
                <item.icon className='mr-4 flex-shrink-0 h-5 w-5' />
                <span className='truncate'>{item.name}</span>
                {item.adminOnly && (
                  <span className='ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full'>
                    Admin
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info */}
        <div
          className='flex-shrink-0 bg-slate-800/50 border-t border-slate-700/50 p-4 relative'
          ref={userMenuRef}
        >
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className='flex items-center w-full p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500'
          >
            <div className='h-10 w-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm font-bold'>
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className='ml-4 flex-1 min-w-0'>
              <p className='text-sm font-semibold text-white truncate'>
                {user?.name}
              </p>
              <p className='text-xs text-slate-400 font-medium'>{user?.role}</p>
            </div>
            <ChevronUp
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </button>

          {showUserMenu && (
            <div className='absolute bottom-full left-4 right-4 mb-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl py-2 z-50 border border-slate-200/50'>
              <div className='px-4 py-3 border-b border-slate-100'>
                <p className='font-semibold text-slate-900'>{user?.name}</p>
                <p className='text-slate-500 text-sm'>{user?.email}</p>
                <p className='text-primary-600 text-xs font-medium mt-1'>
                  {user?.role || 'User'}
                </p>
              </div>
              <div className='py-1'>
                <button className='flex items-center w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-200'>
                  <User className='mr-3 h-4 w-4' />
                  Thông tin cá nhân
                </button>
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200'
                >
                  <LogOut className='mr-3 h-4 w-4' />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
