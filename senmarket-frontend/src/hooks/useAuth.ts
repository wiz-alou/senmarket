import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
  const { initializeAuth, isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialiser l'auth depuis localStorage
    initializeAuth()
    setIsLoading(false)
  }, [initializeAuth])

  return {
    isLoading,
    isAuthenticated,
    user
  }
}