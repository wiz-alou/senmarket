// 🔧 FAVORITES INITIALIZER COMPATIBLE AVEC VOTRE STRUCTURE AUTH
// src/components/providers/favorites-initializer.tsx

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useFavoritesStore } from '@/stores/favorites.store'

export function FavoritesInitializer({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const { setCurrentUser, currentUserId, debugFavorites } = useFavoritesStore()

  useEffect(() => {
    // Attendre que l'auth store soit hydraté
    if (!isHydrated) {
      console.log('⏳ FavoritesInitializer - En attente de l\'hydratation auth...')
      return
    }

    console.log('🚀 FavoritesInitializer - Auth hydraté:', {
      isAuthenticated,
      userId: user?.id,
      userName: user?.first_name,
      currentFavoritesUserId: currentUserId
    })

    if (isAuthenticated && user) {
      // Utilisateur connecté - initialiser ses favoris
      if (currentUserId !== user.id) {
        console.log('📋 Initialisation favoris pour:', user.first_name, '(', user.id, ')')
        setCurrentUser(user.id)
        
        // Debug en mode développement
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => debugFavorites(), 100)
        }
      } else {
        console.log('✅ Favoris déjà initialisés pour:', user.first_name)
      }
    } else {
      // Pas d'utilisateur - vider les favoris
      if (currentUserId !== null) {
        console.log('🧹 Nettoyage favoris (utilisateur déconnecté)')
        setCurrentUser(null)
      }
    }
  }, [user, isAuthenticated, isHydrated, currentUserId, setCurrentUser, debugFavorites])

  return <>{children}</>
}