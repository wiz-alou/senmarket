// 🔧 FAVORITES INITIALIZER COMPATIBLE AVEC LE NOUVEAU AUTH
// src/components/providers/favorites-initializer.tsx

'use client'

import { useEffect } from 'react'
import { useAuthGuard } from './AuthProvider'
import { useFavoritesStore } from '@/stores/favorites.store'

export function FavoritesInitializer({ children }: { children: React.ReactNode }) {
  // ✅ UTILISER LE HOOK AUTHGUARD AU LIEU DU STORE DIRECT
  const { isAuthenticated, isLoading, user } = useAuthGuard()
  const setCurrentUser = useFavoritesStore(state => state.setCurrentUser)

  useEffect(() => {
    // Attendre que l'auth soit chargée
    if (isLoading) {
      console.log('⏳ FavoritesInitializer - En attente de l\'auth...')
      return
    }

    console.log('🚀 FavoritesInitializer - État auth:', {
      isAuthenticated,
      userId: user?.id,
      userName: user?.first_name
    })

    if (isAuthenticated && user) {
      // Utilisateur connecté - charger ses favoris
      console.log('📋 Chargement favoris pour:', user.first_name, '(', user.id, ')')
      setCurrentUser(user.id)
    } else {
      // Pas d'utilisateur - vider les favoris
      console.log('🧹 Nettoyage favoris (utilisateur déconnecté)')
      setCurrentUser(null)
    }
  }, [user, isAuthenticated, isLoading, setCurrentUser])

  return <>{children}</>
}