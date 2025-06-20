// 🔧 APP PROVIDERS CORRIGÉ
// src/components/providers/app-providers.tsx

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from './toast-provider'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store' // ✅ Import du bon store

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Ne pas retry sur les erreurs 401, 403, 404
              if (error?.response?.status === 401 || 
                  error?.response?.status === 403 || 
                  error?.response?.status === 404) {
                return false
              }
              return failureCount < 2
            },
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  // ✅ RÉCUPÉRER LA FONCTION CORRECTE
  const { loadUserFromStorage } = useAuthStore()

  // ✅ CHARGER L'UTILISATEUR AU DÉMARRAGE
  useEffect(() => {
    console.log('🚀 App Providers - Initialisation auth...')
    loadUserFromStorage()
  }, [loadUserFromStorage])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}