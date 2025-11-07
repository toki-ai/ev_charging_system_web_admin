import React from 'react'
import { cn } from '../../utils/helpers.jsx'

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
        {
          'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-primary-500/25':
            variant === 'default',
          'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md':
            variant === 'outline',
          'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm':
            variant === 'secondary',
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25':
            variant === 'destructive',
          'hover:bg-slate-100 text-slate-700 hover:text-slate-900':
            variant === 'ghost',
          'text-primary-600 underline-offset-4 hover:underline font-medium':
            variant === 'link',
        },
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3 text-xs': size === 'sm',
          'h-12 rounded-lg px-8 text-base': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
