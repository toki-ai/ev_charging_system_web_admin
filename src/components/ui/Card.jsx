import React from 'react'
import { cn } from '../../utils/helpers.jsx'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-soft hover:shadow-lg transition-all duration-300 animate-fade-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-2 p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'text-xl font-bold leading-none tracking-tight text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-slate-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6 pt-2', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-between p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}
