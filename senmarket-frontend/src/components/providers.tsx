// ================================================
// PROVIDERS - src/components/providers.tsx
// SenMarket - Providers globaux 📱
// ================================================

'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// Configuration du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 404
        if ((error as any)?.status === 404) return false
        return failureCount < 3
      },
    },
  },
})

// Configuration des toasts
const toastOptions = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    maxWidth: '400px',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
    style: {
      border: '1px solid #10b981',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      border: '1px solid #ef4444',
    },
  },
  loading: {
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
    style: {
      border: '1px solid #3b82f6',
    },
  },
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* Toasts pour les notifications */}
      <Toaster toastOptions={toastOptions} />
      
      {/* DevTools React Query (seulement en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}