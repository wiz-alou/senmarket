// ================================================
// LOADING SPINNER - src/components/common/loading-spinner.tsx
// SenMarket - Spinner océanique premium ⏳
// ================================================

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-4',
      className
    )}>
      {/* Spinner océanique */}
      <div className="relative">
        {/* Cercle extérieur */}
        <div className={cn(
          'border-4 border-blue-100 rounded-full',
          sizeClasses[size]
        )} />
        
        {/* Cercle animé */}
        <div className={cn(
          'absolute top-0 left-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin',
          sizeClasses[size]
        )} />
        
        {/* Point central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Texte de chargement */}
      {text && (
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// Composant de chargement pour les pages entières
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Chargement..." />
        <div className="mt-4">
          <div className="font-semibold text-gradient">SenMarket</div>
          <div className="text-sm text-muted-foreground">Marketplace du Sénégal</div>
        </div>
      </div>
    </div>
  )
}

// Composant de chargement pour les cartes
export function CardLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  )
}

// Skeleton pour les listes
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-12 h-12 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}