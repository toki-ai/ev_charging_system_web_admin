import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className='h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'>
      <Sidebar />

      {isMobileMenuOpen && (
        <div className='fixed inset-0 flex z-40 md:hidden'>
          <div
            className='fixed inset-0 bg-slate-900/80 backdrop-blur-sm'
            onClick={toggleMobileMenu}
          />
          <div className='relative flex-1 flex flex-col max-w-xs w-full'>
            <Sidebar />
          </div>
        </div>
      )}

      <div className='flex flex-col w-0 flex-1 overflow-hidden md:ml-72'>
        <Navbar
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          <div className='py-8'>
            <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-10'>
              <div className='animate-fade-in'>{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
