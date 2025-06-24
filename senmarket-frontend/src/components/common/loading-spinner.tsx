import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-b-2 border-ocean-600',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

// Spinner pour page complète
export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-ocean-600 font-medium">Chargement...</p>
      </div>
    </div>
  )
}

// Spinner inline simple
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent',
        className
      )}
    />
  )
}