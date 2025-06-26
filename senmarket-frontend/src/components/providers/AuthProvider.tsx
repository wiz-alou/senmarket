'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isHydrated, syncWithLocalStorage } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log('🚀 AuthProvider: Initialisation...')
    
    // Forcer la synchronisation avec localStorage
    syncWithLocalStorage()
    
    // Marquer comme initialisé
    setIsInitialized(true)
    
    console.log('✅ AuthProvider: Initialisé')
  }, [syncWithLocalStorage])

  // Attendre l'initialisation
  if (!isInitialized || !isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-slate-700 text-lg font-medium">Initialisation...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function useAuthGuard() {
  const { isAuthenticated, isHydrated, user, token } = useAuthStore()
  
  return {
    isAuthenticated: isHydrated && isAuthenticated && !!user && !!token,
    isLoading: !isHydrated,
    user,
    token
  }
}