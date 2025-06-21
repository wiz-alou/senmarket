// 🔧 COMPOSANT POUR INITIALISER LES FAVORIS
// src/components/providers/favorites-initializer.tsx

'use client'

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useFavoritesStore } from '@/stores/favorites.store';

export function FavoritesInitializer({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const setCurrentUser = useFavoritesStore(state => state.setCurrentUser);

  useEffect(() => {
    console.log('🚀 FavoritesInitializer - État auth:', { 
      isAuthenticated, 
      userId: user?.id, 
      userName: user?.first_name 
    });

    if (isAuthenticated && user) {
      // Utilisateur connecté - charger ses favoris
      console.log('📋 Chargement favoris pour:', user.first_name, '(', user.id, ')');
      setCurrentUser(user.id);
    } else {
      // Pas d'utilisateur - vider les favoris
      console.log('🧹 Nettoyage favoris (utilisateur déconnecté)');
      setCurrentUser(null);
    }
  }, [user, isAuthenticated, setCurrentUser]);

  return <>{children}</>;
}