import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Activity,
  FileText,
  Wrench,
  Settings,
  Zap,
  Calendar,
  ShoppingCart,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { USER_ROLES } from '../../constants/api.jsx'

const adminMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Stations', href: '/stations', icon: MapPin },
  { name: 'Sessions', href: '/sessions', icon: Activity },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const staffMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sessions', href: '/sessions', icon: Activity },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Packages', href: '/packages', icon: ShoppingCart },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export default function Sidebar() {
  const { user } = useAuth()

  const menuItems =
    user?.role === USER_ROLES.ADMIN ? adminMenuItems : staffMenuItems

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
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info */}
        <div className='flex-shrink-0 bg-slate-800/50 border-t border-slate-700/50 p-4'>
          <div className='flex items-center'>
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
          </div>
        </div>
      </div>
    </div>
  )
}
