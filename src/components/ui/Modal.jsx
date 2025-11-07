import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers.jsx'

export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto animate-fade-in'>
      <div
        className='fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-all duration-300'
        onClick={onClose}
      />

      <div
        className={cn(
          'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/25 max-w-2xl w-full mx-6 max-h-[90vh] overflow-y-auto border border-slate-200/50',
          className
        )}
      >
        {title && (
          <div className='flex items-center justify-between p-8 border-b border-slate-200/50'>
            <h3 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
              {title}
            </h3>
            <button
              onClick={onClose}
              className='text-slate-400 hover:text-slate-600 transition-colors duration-200 p-2 rounded-xl hover:bg-slate-100'
            >
              <X className='h-6 w-6' />
            </button>
          </div>
        )}

        <div className={title ? 'p-8' : 'p-8'}>{children}</div>
      </div>
    </div>
  )
}

export function ModalBody({ children, className }) {
  return <div className={cn('p-8', className)}>{children}</div>
}

export function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end space-x-4 p-8 border-t border-slate-200/50',
        className
      )}
    >
      {children}
    </div>
  )
}
