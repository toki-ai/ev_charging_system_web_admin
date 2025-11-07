import React from 'react'
import { cn } from '../../utils/helpers.jsx'

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 shadow-md',
        {
          'border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 shadow-slate-200/50':
            variant === 'default',
          'border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-slate-200/50':
            variant === 'secondary',
          'border-transparent bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-red-200/50':
            variant === 'destructive',
          'border-transparent bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 shadow-emerald-200/50':
            variant === 'success',
          'border-transparent bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 shadow-amber-200/50':
            variant === 'warning',
          'border-transparent bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-orange-200/50':
            variant === 'error',
          'border-transparent bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-blue-200/50':
            variant === 'info',
          'border-transparent bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-primary-200/50':
            variant === 'primary',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
