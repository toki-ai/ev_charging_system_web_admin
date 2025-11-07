import React from 'react'
import { cn } from '../../utils/helpers.jsx'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm shadow-md transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        className
      )}
      {...props}
    />
  )
}

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn('text-sm font-semibold text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  )
}

export function FormGroup({ children, className }) {
  return <div className={cn('space-y-3', className)}>{children}</div>
}
