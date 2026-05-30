import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'icon' && 'p-1.5',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
        variant === 'danger' && 'text-gray-400 hover:bg-red-50 hover:text-red-500',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
