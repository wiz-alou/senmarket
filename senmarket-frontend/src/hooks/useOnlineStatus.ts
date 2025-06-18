import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores'

export const useOnlineStatus = () => {
  const { isOnline, setOnlineStatus } = useAppStore()

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Vérifier le statut initial
    setOnlineStatus(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])

  return isOnline
}